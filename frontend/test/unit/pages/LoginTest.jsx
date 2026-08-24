import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login.jsx';
import { useAuth } from '../../../src/context/AuthContext.jsx';

jest.mock('../../../src/context/AuthContext.jsx', () => ({
    useAuth: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

function renderLogin() {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
}

describe('Login', () => {
    let mockLogin;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogin = jest.fn();
        useAuth.mockReturnValue({ login: mockLogin });
    });

    it('calls login with the entered email and password on submit', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue();
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password123');
        });
    });

    it('navigates to /dashboard on successful login', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue();
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows an error message and does not navigate when login fails', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpass');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
        expect(screen.getByText('Invalid credentials')).toHaveAttribute('role', 'alert');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('falls back to a generic error message when the server gives none', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error('network down'));
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText('Login failed')).toBeInTheDocument();
        });
    });

    it('disables the submit button and shows a loading label while submitting', async () => {
        const user = userEvent.setup();
        let resolveLogin;
        mockLogin.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        user.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText('Logging in...')).toBeInTheDocument();
            expect(screen.getByText('Logging in...')).toBeDisabled();
        });

        resolveLogin();
        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    });
});