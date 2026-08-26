import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../../../src/pages/Landing.jsx';

function renderLanding() {
    return render(
        <MemoryRouter>
            <Landing />
        </MemoryRouter>
    );
}

describe('Landing', () => {
    it('renders the app name', () => {
        renderLanding();

        expect(screen.getByText('Noteverse')).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
        renderLanding();

        const loginLink = screen.getByText('Login');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders a link to the register page', () => {
        renderLanding();

        const registerLink = screen.getByText('Register');
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});