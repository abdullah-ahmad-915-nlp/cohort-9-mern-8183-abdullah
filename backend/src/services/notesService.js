import { createNote, findNotesByOwner, findNoteById, updateNoteById, deleteNoteById } from "../repositories/notesRepository.js";

async function createNoteForUser(userId, title, content) {
    if (!title || !content) {
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
    if (updates.title !== undefined && !updates.title) {
        const err = new Error('Title cannot be empty');
        err.statusCode = 400;
        throw err;
    }

    if (updates.content !== undefined && !updates.content) {
        const err = new Error('Content cannot be empty');
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