import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserByEmailWithPassword } from '../repositories/userRepository.js';

const EMAIL_REGEX = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

function isValidEmailFormat(email) {
    return typeof email === 'string' && EMAIL_REGEX.test(email);
}

async function registerUser(name, email, password) {
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string'
        || !name || !email || !password) {
        const err = new Error('Please fill all the fields');
        err.statusCode = 400;
        throw err;
    }

    if (!isValidEmailFormat(email)) {
        const err = new Error('Please enter a valid email address');
        err.statusCode = 400;
        throw err;
    }

    const userExists = await findUserByEmail(email);

    if (userExists) {
        const err = new Error('User already exists');
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    try {
        user = await createUser({ name, email, password: hashedPassword });
    }
    catch (err) {
        if (err.code === 11000) {
            const conflictErr = new Error('User already exists');
            conflictErr.statusCode = 409;
            throw conflictErr;
        }
        throw err;
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
}

async function loginUser(email, password) {
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        const err = new Error('Please fill all the fields');
        err.statusCode = 400;
        throw err;
    }

    if (!isValidEmailFormat(email)) {
        const err = new Error('Please enter a valid email address');
        err.statusCode = 400;
        throw err;
    }

    const user = await findUserByEmailWithPassword(email);

    if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return token;
}

export { registerUser, loginUser };