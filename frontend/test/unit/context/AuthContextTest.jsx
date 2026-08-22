import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../../src/context/AuthContext.jsx';
import { api, fetchCsrfToken } from '../../../src/services/api.js';

jest.mock('../../../src/services/api.js', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn()
    },
    fetchCsrfToken: jest.fn()
}));

function Consumer() {
    const { user, loading, logoutError, register, login, logout } = useAuth();

    async function handleRegister() {
        try {
            await register('Test User', 'test@example.com', 'password123');
        }
        catch (err) {
            // Catch
        }
    }

    async function handleLogin() {
        try {
            await login('test@example.com', 'password123');
        }
        catch (err) {
            // Catch
        }
    }

    return (
        <div>
            <span data-testid="loading">{String(loading)}</span>
            <span data-testid="user">{user ? user.name : 'none'}</span>
            <span data-testid="logoutError">{logoutError}</span>
            <button onClick={handleRegister}>register</button>
            <button onClick={handleLogin}>login</button>
            <button onClick={() => logout()}>logout</button>
        </div>
    );
}

function renderWithProvider() {
    return render(
        <AuthProvider>
            <Consumer />
        </AuthProvider>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkAuth (mount-time effect)', () => {
        it('sets user from /auth/me on successful mount check', async () => {
            api.get.mockResolvedValueOnce({ data: { name: 'Alice' } });

            renderWithProvider();

            expect(screen.getByTestId('loading').textContent).toBe('true');

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            expect(screen.getByTestId('user').textContent).toBe('Alice');
        });

        it('sets user to null and resolves loading when the mount check fails', async () => {
            api.get.mockRejectedValueOnce(new Error('not authenticated'));

            renderWithProvider();

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            expect(screen.getByTestId('user').textContent).toBe('none');
        });
    });

    describe('login', () => {
        it('sets user on successful login', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: null });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            fetchCsrfToken.mockResolvedValueOnce();
            api.post.mockResolvedValueOnce({});
            api.get.mockResolvedValueOnce({ data: { name: 'Bob' } });

            await user.click(screen.getByText('login'));

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('Bob');
            });
        });

        it('clears user and rethrows when login fails', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: { name: 'Existing' } });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Existing'));

            api.post.mockRejectedValueOnce(new Error('invalid credentials'));

            await user.click(screen.getByText('login'));

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('none');
            });
        });

        it('clears a stale logoutError when a new login attempt starts', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: null });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            api.post.mockRejectedValueOnce(new Error('server error'));
            await user.click(screen.getByText('logout'));
            await waitFor(() => {
                expect(screen.getByTestId('logoutError').textContent).toBe('Failed to logout on the server');
            });

            api.post.mockResolvedValueOnce({});
            fetchCsrfToken.mockResolvedValueOnce();
            api.get.mockResolvedValueOnce({ data: { name: 'Carol' } });

            await user.click(screen.getByText('login'));

            await waitFor(() => {
                expect(screen.getByTestId('logoutError').textContent).toBe('');
            });
        });
    });

    describe('logout', () => {
        it('clears user even when the server logout call fails', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: { name: 'Dave' } });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Dave'));

            api.post.mockRejectedValueOnce(new Error('server down'));

            await user.click(screen.getByText('logout'));

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('none');
            });
        });

        it('sets logoutError when the server logout call fails', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: { name: 'Eve' } });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Eve'));

            api.post.mockRejectedValueOnce(new Error('server down'));

            await user.click(screen.getByText('logout'));

            await waitFor(() => {
                expect(screen.getByTestId('logoutError').textContent).toBe('Failed to logout on the server');
            });
        });

        it('clears logoutError on a successful logout', async () => {
            const user = userEvent.setup();
            api.get.mockResolvedValueOnce({ data: { name: 'Frank' } });
            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Frank'));

            api.post.mockResolvedValueOnce({});
            fetchCsrfToken.mockResolvedValueOnce();

            await user.click(screen.getByText('logout'));

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('none');
            });
            expect(screen.getByTestId('logoutError').textContent).toBe('');
        });
    });
});