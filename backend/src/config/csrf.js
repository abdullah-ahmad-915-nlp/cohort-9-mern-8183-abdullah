import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    cookieName: 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    },
    size: 64,
    getSessionIdentifier: (req) => req.cookies.token || 'anonymous',
});

export { doubleCsrfProtection, generateCsrfToken };