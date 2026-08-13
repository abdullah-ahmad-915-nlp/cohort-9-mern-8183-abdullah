import { generateCsrfToken } from '../config/csrf.js';

function getCsrfToken(req, res) {
    const token = generateCsrfToken(req, res);
    res.status(200).json({ csrfToken: token });
}

export { getCsrfToken };