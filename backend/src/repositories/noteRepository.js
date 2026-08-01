import { Note } from '../models/Note.js';

async function createNote(noteData) {
    return Note.create(noteData);    
}

async function findNotesByOwner(ownerId) {
    return Note.find({ owner: ownerId });
}

async function findNoteById(id) {
    return Note.findById(id);
}

async function updateNoteById(id, updates) {
    return Note.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

async function deleteNoteById(id) {
    return Note.findByIdAndDelete(id);
}

export { createNote, findNotesByOwner, findNoteById, updateNoteById, deleteNoteById }