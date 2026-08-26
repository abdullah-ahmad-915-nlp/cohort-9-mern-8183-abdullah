import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { stripHtml } from '../utils/stripHtml.js';
import '../styles/NoteCard.css';
import '../styles/Spinner.css';

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