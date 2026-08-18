function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, tr, blockquote, pre, div';
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
        <div>
            <h3>{note.title}</h3>
            <p>{preview}</p>
            <span>{formattedDate}, {formattedTime}</span>
            <div>
                <button onClick={onEdit} disabled={isDeleting}>Edit</button>
                <button onClick={onDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
        </div>
    );
}

export default NoteCard;