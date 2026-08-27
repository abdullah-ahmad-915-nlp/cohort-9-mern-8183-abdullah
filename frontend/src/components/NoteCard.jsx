import { Pencil, Trash2, Loader2 } from 'lucide-react';
import '../styles/NoteCard.css';
import '../styles/Spinner.css';

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    div.querySelectorAll('br').forEach((el) => {
        el.replaceWith(' ');
    });

    const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, tr, td, th, blockquote, pre, div';
    const blockElements = div.querySelectorAll(blockSelectors);

    blockElements.forEach((el) => {
        el.insertAdjacentText('beforeend', ' ');
    });

    const text = div.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
}

function NoteCard({ note, isDeleting, onEdit, onDelete }) {
    const rawText = stripHtml(note.content);

    let preview;

    if (rawText.length > 100) {
        preview = rawText.substring(0, 100) + '...';
    }
    else {
        preview = rawText;
    }

    const formattedDate = new Date(note.updatedAt).toLocaleDateString();

    const formattedTime = new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

    return (
        <div className="note-card">
            <div className="note-card-body">
                <div className="note-card-text">
                    <h3 className="note-card-title">{note.title}</h3>
                    <p className="note-card-preview">{preview}</p>
                </div>
                <span className="note-card-date">{formattedDate}, {formattedTime}</span>
            </div>
            <div className="note-card-actions">
                <button onClick={onEdit} disabled={isDeleting} className="btn btn-secondary note-card-btn">
                    <Pencil size={14} aria-hidden="true" />
                    Edit
                </button>
                <button onClick={onDelete} disabled={isDeleting} className="btn btn-danger note-card-btn">
                    {isDeleting ? (
                        <Loader2 size={14} className="spin" aria-hidden="true" />
                    ) : (
                        <Trash2 size={14} aria-hidden="true" />
                    )}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
}

export default NoteCard;