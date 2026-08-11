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
        res.status(200).json({ token });
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

export { register, login, getMe };