import { api } from './api.js';

async function createNote(title, content) {
    const response = await api.post('/notes', { title, content });
    return response.data;
}

async function getNotes() {
    const response = await api.get('/notes');
    return response.data;
}

async function getNoteById(id) {
    const response = await api.get(`/notes/${id}`);
    return response.data;
}

async function updateNote(id, updates) {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
}

async function deleteNote(id) {
    await api.delete(`/notes/${id}`);
}

export { createNote, getNotes, getNoteById, updateNote, deleteNote };