import jwt from 'jsonwebtoken';
import { findUserById } from '../repositories/userRepository.js';

async function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}

export { authMiddleware };