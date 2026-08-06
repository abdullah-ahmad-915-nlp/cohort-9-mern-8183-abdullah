import { createNoteForUser, getNotesForUser, getNoteForUser, updateNoteForUser, deleteNoteForUser } from "../services/notesService.js";

async function createNote(req, res, next) {
    const userId = req.user._id;
    const { title, content } = req.body;

    try {
        const note = await createNoteForUser(userId, title, content);
        res.status(201).json(note);
    }
    catch (err) {
        next(err);
    }
}

async function getNotes(req, res, next) {
    const userId = req.user._id;
    
    try {
        const notes = await getNotesForUser(userId);
        res.status(200).json(notes);
    }
    catch (err) {
        next(err);
    }
}

async function getNote(req, res, next) {
    const userId = req.user._id;
    const noteId = req.params.id;

    try {
        const note = await getNoteForUser(userId, noteId);
        res.status(200).json(note);
    }
    catch (err) {
        next(err);
    }
}

async function updateNote(req, res, next) {
    const userId = req.user._id;
    const noteId = req.params.id;
    const updates = req.body;

    try {
        const updatedNote = await updateNoteForUser(userId, noteId, updates);
        res.status(200).json(updatedNote);
    }
    catch (err) {
        next(err);
    }
}

async function deleteNote(req, res, next) {
    const userId = req.user._id;
    const noteId = req.params.id;

    try {
        const deletedNote = await deleteNoteForUser(userId, noteId);
        res.status(200).json(deletedNote);
    }
    catch (err) {
        next(err);
    }
}

export { createNote, getNotes, getNote, updateNote, deleteNote };