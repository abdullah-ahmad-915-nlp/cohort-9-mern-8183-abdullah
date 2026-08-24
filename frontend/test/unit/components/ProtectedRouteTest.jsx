import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../src/components/ProtectedRoute.jsx';
import { useAuth } from '../../../src/context/AuthContext.jsx';

jest.mock('../../../src/context/AuthContext.jsx', () => ({
    useAuth: jest.fn()
}));

function renderProtectedRoute() {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <div>Protected content</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<div>Login page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator while auth state is loading', () => {
        useAuth.mockReturnValue({ user: null, loading: true });

        renderProtectedRoute();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });

    it('redirects to /login when there is no user', () => {
        useAuth.mockReturnValue({ user: null, loading: false });

        renderProtectedRoute();

        expect(screen.getByText('Login page')).toBeInTheDocument();
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });

    it('renders children when a user is present', () => {
        useAuth.mockReturnValue({ user: { name: 'Alice' }, loading: false });

        renderProtectedRoute();

        expect(screen.getByText('Protected content')).toBeInTheDocument();
    });
});