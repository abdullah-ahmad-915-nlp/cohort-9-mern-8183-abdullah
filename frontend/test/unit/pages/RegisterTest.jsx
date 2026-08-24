import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/pages/Register.jsx';
import { useAuth } from '../../../src/context/AuthContext.jsx';

jest.mock('../../../src/context/AuthContext.jsx', () => ({
    useAuth: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

function renderRegister() {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );
}

describe('Register', () => {
    let mockRegister;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRegister = jest.fn();
        useAuth.mockReturnValue({ register: mockRegister });
    });

    it('calls register with the entered name, email, and password on submit', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue();
        renderRegister();

        await user.type(screen.getByLabelText('Name'), 'Alice Smith');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('Alice Smith', 'alice@example.com', 'password123');
        });
    });

    it('navigates to /login on successful registration', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue();
        renderRegister();

        await user.type(screen.getByLabelText('Name'), 'Alice Smith');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('shows an error message and does not navigate when registration fails', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue({ response: { data: { error: 'Email already in use' } } });
        renderRegister();

        await user.type(screen.getByLabelText('Name'), 'Alice Smith');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(screen.getByText('Email already in use')).toBeInTheDocument();
        });
        expect(screen.getByText('Email already in use')).toHaveAttribute('role', 'alert');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('falls back to a generic error message when the server gives none', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('network down'));
        renderRegister();

        await user.type(screen.getByLabelText('Name'), 'Alice Smith');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });

    it('disables the submit button and shows a loading label while submitting', async () => {
        const user = userEvent.setup();
        let resolveRegister;
        mockRegister.mockReturnValue(new Promise((resolve) => { resolveRegister = resolve; }));
        renderRegister();

        await user.type(screen.getByLabelText('Name'), 'Alice Smith');
        await user.type(screen.getByLabelText('Email'), 'alice@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        user.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(screen.getByText('Registering...')).toBeInTheDocument();
            expect(screen.getByText('Registering...')).toBeDisabled();
        });

        resolveRegister();
        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    });
});