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

        it('does not crash when a note from the API has a missing or non-string title/content', async () => {
            getNotes.mockResolvedValue([
                { _id: '1', title: null, content: undefined, updatedAt: '2026-01-15T10:30:00.000Z' },
                { _id: '2', updatedAt: '2026-01-16T10:30:00.000Z' }
            ]);
            renderDashboard();

            await waitFor(() => {
                expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
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
                makeNote({ _id: '2', title: 'Note Two' })
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

    describe('search', () => {
        it('filters notes by title match', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Grocery List', content: '<p>milk, eggs</p>' }),
                makeNote({ _id: '2', title: 'Meeting Notes', content: '<p>discuss roadmap</p>' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Grocery List')).toBeInTheDocument());

            await user.type(screen.getByLabelText('Search notes by title or content'), 'grocery');

            expect(screen.getByText('Grocery List')).toBeInTheDocument();
            expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument();
        });

        it('filters notes by content match (case-insensitive, HTML stripped)', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Note One', content: '<p>Contains the word ROADMAP here</p>' }),
                makeNote({ _id: '2', title: 'Note Two', content: '<p>Nothing relevant</p>' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Note One')).toBeInTheDocument());

            await user.type(screen.getByLabelText('Search notes by title or content'), 'roadmap');

            expect(screen.getByText('Note One')).toBeInTheDocument();
            expect(screen.queryByText('Note Two')).not.toBeInTheDocument();
        });

        it('shows a no-results message when the search matches nothing', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([makeNote({ title: 'Grocery List' })]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Grocery List')).toBeInTheDocument());

            await user.type(screen.getByLabelText('Search notes by title or content'), 'nonexistent');

            expect(screen.getByText('No notes match "nonexistent".')).toBeInTheDocument();
        });

        it('clears the search query when the clear button is clicked', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Grocery List' }),
                makeNote({ _id: '2', title: 'Meeting Notes' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Grocery List')).toBeInTheDocument());

            const searchInput = screen.getByLabelText('Search notes by title or content');
            await user.type(searchInput, 'grocery');
            expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument();

            await user.click(screen.getByLabelText('Clear search'));

            expect(searchInput).toHaveValue('');
            expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
        });
    });

    describe('sorting', () => {
        it('defaults to latest updated first', async () => {
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' }),
                makeNote({ _id: '2', title: 'Newer', updatedAt: '2026-01-15T00:00:00.000Z' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Older')).toBeInTheDocument());

            const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
            expect(titles).toEqual(['Newer', 'Older']);
        });

        it('sorts by earliest updated first when selected', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' }),
                makeNote({ _id: '2', title: 'Newer', updatedAt: '2026-01-15T00:00:00.000Z' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Older')).toBeInTheDocument());

            await user.click(screen.getByRole('button', { name: 'Sort notes' }));
            await user.click(screen.getByText('Oldest updated first'));

            const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
            expect(titles).toEqual(['Older', 'Newer']);
        });

        it('sorts by title A to Z when selected', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Zebra' }),
                makeNote({ _id: '2', title: 'Apple' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Zebra')).toBeInTheDocument());

            await user.click(screen.getByRole('button', { name: 'Sort notes' }));
            await user.click(screen.getByText('A to Z'));

            const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
            expect(titles).toEqual(['Apple', 'Zebra']);
        });

        it('sorts by title Z to A when selected', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Apple' }),
                makeNote({ _id: '2', title: 'Zebra' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());

            await user.click(screen.getByRole('button', { name: 'Sort notes' }));
            await user.click(screen.getByText('Z to A'));

            const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
            expect(titles).toEqual(['Zebra', 'Apple']);
        });

        it('applies sorting on top of an active search filter', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([
                makeNote({ _id: '1', title: 'Zebra Notes', updatedAt: '2026-01-01T00:00:00.000Z' }),
                makeNote({ _id: '2', title: 'Apple Notes', updatedAt: '2026-01-15T00:00:00.000Z' }),
                makeNote({ _id: '3', title: 'Unrelated', updatedAt: '2026-01-20T00:00:00.000Z' })
            ]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Zebra Notes')).toBeInTheDocument());

            await user.type(screen.getByLabelText('Search notes by title or content'), 'notes');
            await user.click(screen.getByRole('button', { name: 'Sort notes' }));
            await user.click(screen.getByText('A to Z'));

            const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
            expect(titles).toEqual(['Apple Notes', 'Zebra Notes']);
        });

        it('closes the sort menu after a selection is made', async () => {
            const user = userEvent.setup();
            getNotes.mockResolvedValue([makeNote({ title: 'Only Note' })]);
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Only Note')).toBeInTheDocument());

            await user.click(screen.getByRole('button', { name: 'Sort notes' }));
            expect(screen.getByText('A to Z')).toBeInTheDocument();

            await user.click(screen.getByText('A to Z'));

            expect(screen.queryByText('Oldest updated first')).not.toBeInTheDocument();
        });
    });
});