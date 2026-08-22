import { render, screen } from '@testing-library/react';
import App from '../../src/App.jsx';
import { useAuth } from '../../src/context/AuthContext.jsx';

jest.mock('../../src/context/AuthContext.jsx', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../src/pages/Landing.jsx', () => () => <div>Landing page</div>);
jest.mock('../../src/pages/Register.jsx', () => () => <div>Register page</div>);
jest.mock('../../src/pages/Login.jsx', () => () => <div>Login page</div>);
jest.mock('../../src/pages/Dashboard.jsx', () => () => <div>Dashboard page</div>);
jest.mock('../../src/pages/NoteEditor.jsx', () => () => <div>NoteEditor page</div>);

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.history.pushState({}, '', '/');
    });

    it('renders the logoutError banner as role="alert" when logoutError is set', () => {
        useAuth.mockReturnValue({ logoutError: 'Failed to logout on the server' });

        render(<App />);

        const alert = screen.getByText('Failed to logout on the server');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('role', 'alert');
    });

    it('does not render a logoutError banner when logoutError is empty', () => {
        useAuth.mockReturnValue({ logoutError: '' });

        render(<App />);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders the Landing page at the root path', () => {
        useAuth.mockReturnValue({ logoutError: '' });
        window.history.pushState({}, '', '/');

        render(<App />);

        expect(screen.getByText('Landing page')).toBeInTheDocument();
    });

    it('renders the Login page at /login', () => {
        useAuth.mockReturnValue({ logoutError: '' });
        window.history.pushState({}, '', '/login');

        render(<App />);

        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('renders the Register page at /register', () => {
        useAuth.mockReturnValue({ logoutError: '' });
        window.history.pushState({}, '', '/register');

        render(<App />);

        expect(screen.getByText('Register page')).toBeInTheDocument();
    });
});