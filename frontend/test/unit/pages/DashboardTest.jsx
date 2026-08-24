import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../../src/pages/Dashboard.jsx';
import { getNotes, deleteNote } from '../../../src/services/notesApi.js';
import { useAuth } from '../../../src/context/AuthContext.jsx';

jest.mock('../../../src/services/notesApi.js', () => ({
    getNotes: jest.fn(),
    deleteNote: jest.fn()
}));

jest.mock('../../../src/context/AuthContext.jsx', () => ({
    useAuth: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

function makeNote(overrides = {}) {
    return {
        _id: '1',
        title: 'Test note',
        content: '<p>hello</p>',
        updatedAt: '2026-01-15T10:30:00.000Z',
        ...overrides
    };
}

function renderDashboard() {
    return render(
        <MemoryRouter>
            <Dashboard />
        </MemoryRouter>
    );
}

describe('Dashboard', () => {
    let confirmSpy;
    let mockLogout;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogout = jest.fn().mockResolvedValue();
        useAuth.mockReturnValue({ user: { name: 'Alice' }, logout: mockLogout });
        confirmSpy = jest.spyOn(window, 'confirm');
    });

    afterEach(() => {
        confirmSpy.mockRestore();
    });

    describe('loading and fetch states', () => {
        it('shows a loading indicator while notes are being fetched', () => {
            getNotes.mockReturnValue(new Promise(() => {}));
            renderDashboard();

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('shows the note list once notes have loaded', async () => {
            getNotes.mockResolvedValue([makeNote({ title: 'My First Note' })]);
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('My First Note')).toBeInTheDocument();
            });
        });

        it('shows an empty-state message when there are no notes', async () => {
            getNotes.mockResolvedValue([]);
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('No notes here. Create your first one!')).toBeInTheDocument();
            });
        });

        it('shows a fetch error when loading notes fails', async () => {
            getNotes.mockRejectedValue({ response: { data: { error: 'Network error' } } });
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('falls back to a generic fetch error message when the server gives none', async () => {
            getNotes.mockRejectedValue(new Error('boom'));
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
            });
        });
    });

    describe('note deletion', () => {
        it('removes a note from the list after a successful deletion', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([makeNote({ _id: '1', title: 'Note One' })]);
            deleteNote.mockResolvedValue();
            confirmSpy.mockReturnValue(true);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Note One')).toBeInTheDocument());

            await user.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(screen.queryByText('Note One')).not.toBeInTheDocument();
            });
        });

        it('does not delete when the user cancels the confirmation dialog', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([makeNote({ _id: '1', title: 'Note One' })]);
            confirmSpy.mockReturnValue(false);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Note One')).toBeInTheDocument());

            await user.click(screen.getByText('Delete'));

            expect(deleteNote).not.toHaveBeenCalled();
            expect(screen.getByText('Note One')).toBeInTheDocument();
        });

        it('shows a deletion error scoped to only the note that failed', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Note One' }),
                makeNote({ _id: '2', title: 'Note Two' }),
            ]);
            confirmSpy.mockReturnValue(true);
            deleteNote.mockRejectedValueOnce({ response: { data: { error: 'Cannot delete Note One' } } });
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Note One')).toBeInTheDocument());

            const deleteButtons = screen.getAllByText('Delete');
            await user.click(deleteButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('Cannot delete Note One')).toBeInTheDocument();
            });

            expect(screen.getByText('Note One')).toBeInTheDocument();
            expect(screen.getByText('Note Two')).toBeInTheDocument();
        });

        it('does not carry a previous deletion error over to a successful retry', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([makeNote({ _id: '1', title: 'Note One' })]);
            confirmSpy.mockReturnValue(true);
            deleteNote.mockRejectedValueOnce({ response: { data: { error: 'Failed once' } } });
            deleteNote.mockResolvedValueOnce();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Note One')).toBeInTheDocument());

            await user.click(screen.getByText('Delete'));
            await waitFor(() => expect(screen.getByText('Failed once')).toBeInTheDocument());

            await user.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(screen.queryByText('Note One')).not.toBeInTheDocument();
            });
        });
    });

    describe('logout', () => {
        it('disables the logout button and shows a loading label while logging out', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([]);
            let resolveLogout;
            mockLogout.mockReturnValue(new Promise((resolve) => { resolveLogout = resolve; }));
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());

            user.click(screen.getByText('Logout'));

            await waitFor(() => {
                expect(screen.getByText('Logging out...')).toBeInTheDocument();
                expect(screen.getByText('Logging out...')).toBeDisabled();
            });

            resolveLogout();

            await waitFor(() => {
                expect(screen.getByText('Logout')).toBeInTheDocument();
            });
        });

        it('calls logout when the logout button is clicked', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());

            await user.click(screen.getByText('Logout'));

            expect(mockLogout).toHaveBeenCalledTimes(1);
        });
    });
});