import jwt from 'jsonwebtoken';
import { findUserById } from '../repositories/userRepository.js';

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists'});
        }

        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token'});
    }
}

export { authMiddleware };