import { registerUser, loginUser } from "../services/authService.js";

async function register(req, res, next) {
    const { name, email, password } = req.body;

    try {
        const user = await registerUser(name, email, password);
        res.status(201).json(user);
    }
    catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    const { email, password } = req.body;

    try {
        const token = await loginUser(email, password);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });        
        res.status(200).json({ message: 'Logged in successfully' });
    }
    catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
}

async function getMe(req, res, next) {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        next(err);
    }
}

export { register, login, logout, getMe };