import { createNote, findNotesByOwner, findNoteById, updateNoteById, deleteNoteById } from "../repositories/notesRepository.js";

function isContentEmpty(html) {
    const stripped = html.replace(/<[^>]*>/g, '').trim();
    return stripped.length === 0;
}

async function createNoteForUser(userId, title, content) {
    if (!title || isContentEmpty(content)) {
        const err = new Error('Title and content are required');
        err.statusCode = 400;
        throw err;
    }

    const note = await createNote({ title, content, owner: userId });

    return note;
}

async function getNotesForUser(userId) {
    return findNotesByOwner(userId);
}

async function getNoteForUser(userId, noteId) {
    const note = await findNoteById(noteId);

    if (!note) {
        const err = new Error('Note not found');
        err.statusCode = 404;
        throw err;
    }

    if (note.owner.toString() !== userId.toString()) {
        const err = new Error('Not authorized to access this note');
        err.statusCode = 403;
        throw err;
    }

    return note;
}

async function updateNoteForUser(userId, noteId, updates) {
    const titleInvalid = updates.title !== undefined && !updates.title;
    const contentInvalid = updates.content !== undefined && isContentEmpty(updates.content);

    if (titleInvalid || contentInvalid) {
        const err = new Error('Title and content are required');
        err.statusCode = 400;
        throw err;
    }

    const note = await findNoteById(noteId);

    if (!note) {
        const err = new Error('Note not found');
        err.statusCode = 404;
        throw err;
    }

    if (note.owner.toString() !== userId.toString()) {
        const err = new Error('Not authorized to access this note');
        err.statusCode = 403;
        throw err;
    }

    const updatedNote = await updateNoteById(noteId, updates);

    return updatedNote;
}

async function deleteNoteForUser(userId, noteId) {
    const note = await findNoteById(noteId);

    if (!note) {
        const err = new Error('Note not found');
        err.statusCode = 404;
        throw err;
    }

    if (note.owner.toString() !== userId.toString()) {
        const err = new Error('Not authorized to access this note');
        err.statusCode = 403;
        throw err;
    }

    const deletedNote = await deleteNoteById(noteId);

    return deletedNote;
}

export { createNoteForUser, getNotesForUser, getNoteForUser, updateNoteForUser, deleteNoteForUser };