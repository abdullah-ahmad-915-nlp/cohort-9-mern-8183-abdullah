import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteCard from '../../../src/components/NoteCard.jsx';

function makeNote(overrides = {}) {
    return {
        _id: '1',
        title: 'Test note',
        content: '<p>hello</p>',
        updatedAt: '2026-01-15T10:30:00.000Z',
        ...overrides
    };
}

describe('NoteCard', () => {
    describe('stripHtml preview (via rendered output)', () => {
        it('replaces <br> elements with spaces instead of concatenating text', () => {
            const note = makeNote({ content: '<p>hello<br>world</p>' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('hello world')).toBeInTheDocument();
        });

        it('separates table cell content instead of concatenating it', () => {
            const note = makeNote({ content: '<table><tr><td>A</td><td>B</td></tr></table>' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('A B')).toBeInTheDocument();
        });

        it('separates block-level elements like paragraphs and headings with spaces', () => {
            const note = makeNote({ content: '<h1>Title</h1><p>Body text</p>' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('Title Body text')).toBeInTheDocument();
        });

        it('collapses repeated whitespace into a single space', () => {
            const note = makeNote({ content: '<p>hello</p>\n\n   <p>world</p>' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('hello world')).toBeInTheDocument();
        });

        it('strips tags with no surrounding text left behind', () => {
            const note = makeNote({ content: '<p><strong>bold</strong> and <em>italic</em></p>' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('bold and italic')).toBeInTheDocument();
        });
    });

    describe('preview truncation', () => {
        it('does not truncate content of 100 characters or fewer', () => {
            const shortText = 'a'.repeat(100);
            const note = makeNote({ content: `<p>${shortText}</p>` });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText(shortText)).toBeInTheDocument();
        });

        it('truncates content longer than 100 characters and appends an ellipsis', () => {
            const longText = 'a'.repeat(150);
            const note = makeNote({ content: `<p>${longText}</p>` });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            const expected = longText.substring(0, 100) + '...';
            expect(screen.getByText(expected)).toBeInTheDocument();
        });
    });

    describe('title and date rendering', () => {
        it('renders the note title', () => {
            const note = makeNote({ title: 'My Grocery List' });
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('My Grocery List')).toBeInTheDocument();
        });
    });

    describe('actions', () => {
        it('calls onEdit when the Edit button is clicked', async () => {
            const user = userEvent.setup();
            const onEdit = jest.fn();
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={false} onEdit={onEdit} onDelete={() => {}} />);

            await user.click(screen.getByText('Edit'));

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('calls onDelete when the Delete button is clicked', async () => {
            const user = userEvent.setup();
            const onDelete = jest.fn();
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={onDelete} />);

            await user.click(screen.getByText('Delete'));

            expect(onDelete).toHaveBeenCalledTimes(1);
        });

        it('does not call onEdit or onDelete when isDeleting is true (buttons disabled)', async () => {
            const user = userEvent.setup();
            const onEdit = jest.fn();
            const onDelete = jest.fn();
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={true} onEdit={onEdit} onDelete={onDelete} />);

            await user.click(screen.getByText('Edit'));
            await user.click(screen.getByText('Deleting...'));

            expect(onEdit).not.toHaveBeenCalled();
            expect(onDelete).not.toHaveBeenCalled();
        });
    });

    describe('deleting state', () => {
        it('shows "Deleting..." on the delete button when isDeleting is true', () => {
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={true} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('Deleting...')).toBeInTheDocument();
        });

        it('shows "Delete" on the delete button when isDeleting is false', () => {
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('disables both Edit and Delete buttons when isDeleting is true', () => {
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={true} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('Edit')).toBeDisabled();
            expect(screen.getByText('Deleting...')).toBeDisabled();
        });

        it('enables both buttons when isDeleting is false', () => {
            const note = makeNote();
            render(<NoteCard note={note} isDeleting={false} onEdit={() => {}} onDelete={() => {}} />);

            expect(screen.getByText('Edit')).not.toBeDisabled();
            expect(screen.getByText('Delete')).not.toBeDisabled();
        });
    });
});