import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NoteEditor from '../../../src/pages/NoteEditor.jsx';
import { createNote, updateNote, deleteNote, getNoteById } from '../../../src/services/notesApi.js';

jest.mock('../../../src/services/notesApi.js', () => ({
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    getNoteById: jest.fn()
}));

jest.mock('../../../src/components/RichTextEditor.jsx', () => {
    return function MockRichTextEditor({ content, onChange }) {
        return (
            <textarea
                data-testid="rich-text-editor"
                value={content}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    };
});

const mockNavigate = jest.fn();
let mockParamsId;
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: mockParamsId }),
}));

function renderEditor() {
    return render(
        <MemoryRouter>
            <NoteEditor />
        </MemoryRouter>
    );
}

describe('NoteEditor', () => {
    let confirmSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockParamsId = undefined;
        confirmSpy = jest.spyOn(window, 'confirm');
    });

    afterEach(() => {
        confirmSpy.mockRestore();
    });

    describe('create mode', () => {
        it('starts with an empty title and content, no fetch', () => {
            mockParamsId = undefined;
            renderEditor();

            expect(screen.getByLabelText('Note title')).toHaveValue('');
            expect(getNoteById).not.toHaveBeenCalled();
        });

        it('does not show a Delete button in create mode', () => {
            mockParamsId = undefined;
            renderEditor();

            expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        });

        it('calls createNote and navigates to the dashboard on successful save', async () => {
            const user = userEvent.setup();
            mockParamsId = undefined;
            createNote.mockResolvedValue({});
            renderEditor();

            await user.type(screen.getByLabelText('Note title'), 'New Note');
            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                expect(createNote).toHaveBeenCalledWith('New Note', '');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('edit mode', () => {
        it('fetches the note by id and populates title and content', async () => {
            mockParamsId = '123';
            getNoteById.mockResolvedValue({ title: 'Existing Note', content: '<p>body</p>' });
            renderEditor();

            expect(screen.getByText('Loading...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByLabelText('Note title')).toHaveValue('Existing Note');
            });
            expect(getNoteById).toHaveBeenCalledWith('123');
        });

        it('shows a Delete button in edit mode', async () => {
            mockParamsId = '123';
            getNoteById.mockResolvedValue({ title: 'Existing Note', content: '<p>body</p>' });
            renderEditor();

            await waitFor(() => {
                expect(screen.getByText('Delete')).toBeInTheDocument();
            });
        });

        it('shows a fetch error when the note fails to load', async () => {
            mockParamsId = '123';
            getNoteById.mockRejectedValue({ response: { data: { error: 'Note not found' } } });
            renderEditor();

            await waitFor(() => {
                expect(screen.getByText('Note not found')).toBeInTheDocument();
            });
        });

        it('calls updateNote and navigates to the dashboard on successful save', async () => {
            const user = userEvent.setup();
            mockParamsId = '123';
            getNoteById.mockResolvedValue({ title: 'Existing Note', content: '<p>body</p>' });
            updateNote.mockResolvedValue({});
            renderEditor();

            await waitFor(() => expect(screen.getByLabelText('Note title')).toHaveValue('Existing Note'));

            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                expect(updateNote).toHaveBeenCalledWith('123', { title: 'Existing Note', content: '<p>body</p>' });
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });

        it('calls deleteNote and navigates to the dashboard when delete is confirmed', async () => {
            const user = userEvent.setup();
            mockParamsId = '123';
            getNoteById.mockResolvedValue({ title: 'Existing Note', content: '<p>body</p>' });
            deleteNote.mockResolvedValue();
            confirmSpy.mockReturnValue(true);
            renderEditor();

            expect(await screen.findByText('Delete')).toBeInTheDocument();

            await user.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(deleteNote).toHaveBeenCalledWith('123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });

        it('does not delete when the confirmation dialog is cancelled', async () => {
            const user = userEvent.setup();
            mockParamsId = '123';
            getNoteById.mockResolvedValue({ title: 'Existing Note', content: '<p>body</p>' });
            confirmSpy.mockReturnValue(false);
            renderEditor();

            expect(await screen.findByText('Delete')).toBeInTheDocument();

            await user.click(screen.getByText('Delete'));

            expect(deleteNote).not.toHaveBeenCalled();
        });
    });

    describe('cancel confirmation', () => {
        it('asks for confirmation before navigating away when Cancel is clicked', async () => {
            const user = userEvent.setup();
            mockParamsId = undefined;
            confirmSpy.mockReturnValue(true);
            renderEditor();

            await user.click(screen.getByText('Cancel'));

            expect(confirmSpy).toHaveBeenCalledWith('You will lose all current changes. Continue?');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });

        it('does not navigate away when the cancel confirmation is declined', async () => {
            const user = userEvent.setup();
            mockParamsId = undefined;
            confirmSpy.mockReturnValue(false);
            renderEditor();

            await user.click(screen.getByText('Cancel'));

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('switching notes without unmount (id change)', () => {
        it('resets fetchLoading, fetchError, and error when id changes to a different note', async () => {
            const user = userEvent.setup();
            mockParamsId = '1';
            getNoteById.mockResolvedValueOnce({ title: 'Note One', content: '<p>one</p>' });
            const { rerender } = renderEditor();

            await waitFor(() => expect(screen.getByLabelText('Note title')).toHaveValue('Note One'));

            updateNote.mockRejectedValueOnce({ response: { data: { error: 'Save failed for note 1' } } });
            await user.click(screen.getByText('Save'));
            expect(await screen.findByText('Save failed for note 1')).toBeInTheDocument();

            mockParamsId = '2';
            getNoteById.mockResolvedValueOnce({ title: 'Note Two', content: '<p>two</p>' });
            rerender(
                <MemoryRouter>
                    <NoteEditor />
                </MemoryRouter>
            );

            expect(screen.queryByText('Save failed for note 1')).not.toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByLabelText('Note title')).toHaveValue('Note Two');
            });
            expect(getNoteById).toHaveBeenCalledWith('2');
        });
    });

    describe('save/delete error display', () => {
        it('shows a save error as a role="alert" element', async () => {
            const user = userEvent.setup();
            mockParamsId = undefined;
            createNote.mockRejectedValue({ response: { data: { error: 'Title is required' } } });
            renderEditor();

            await user.click(screen.getByText('Save'));

            await waitFor(() => {
                const alert = screen.getByText('Title is required');
                expect(alert).toHaveAttribute('role', 'alert');
            });
        });
    });

    describe('fetch error sanitization', () => {
        it('shows "Not authorized to access this note" verbatim (known-safe message)', async () => {
            mockParamsId = '123';
            getNoteById.mockRejectedValue({ response: { data: { error: 'Not authorized to access this note' } } });
            renderEditor();

            await waitFor(() => {
                expect(screen.getByText('Not authorized to access this note')).toBeInTheDocument();
            });
        });

        it('replaces an unrecognized backend error message with a generic one', async () => {
            mockParamsId = '123';
            getNoteById.mockRejectedValue({
                response: { data: { error: 'Cast to ObjectId failed for value "abc" (type string) at path "_id" for model "Note"' } },
            });
            renderEditor();

            await waitFor(() => {
                expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            });
            expect(screen.queryByText(/Cast to ObjectId/)).not.toBeInTheDocument();
        });
    });
});