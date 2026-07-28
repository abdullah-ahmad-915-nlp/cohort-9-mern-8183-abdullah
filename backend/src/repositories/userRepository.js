import { User } from '../models/User.js';

async function createUser(userData) {
    return User.create(userData);    
}

async function findUserByEmail(email) {
    return User.findOne({ email });
}

async function findUserById(id) {
    return User.findById(id);
}

export { createUser, findUserByEmail, findUserById };