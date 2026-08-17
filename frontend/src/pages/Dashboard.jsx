import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getNotes, deleteNote } from '../services/notesApi.js';
import NoteCard from '../components/NoteCard.jsx';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [newNoteLoading, setNewNoteLoading] = useState(false);
    const [editNoteLoading, setEditNoteLoading] = useState(false);
    const [deleteNoteLoading, setDeleteNoteLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchNotes() {
            try {
                const data = await getNotes();
                setNotes(data);
            }
            catch (err) {
                setFetchError(err.response?.data?.error || 'Failed to load notes');
            }
            finally {
                setFetchLoading(false);
            }
        }

        fetchNotes();
    }, []);

    function handleLogout() {
        setLogoutLoading(true);
        logout();
        setLogoutLoading(false);
    }

    function handleCreateNew() {
        setNewNoteLoading(true);
        navigate('/notes/new');
        setNewNoteLoading(false);
    }

    function handleNoteEdit(id) {
        setEditNoteLoading(true);
        setEditingId(id);
        navigate(`/notes/${id}`);
        setEditNoteLoading(false);
        setEditingId(null);
    }

    async function handleNoteDelete(id) {
        const confirm = window.confirm('Are you sure you want to delete this note?');

        if (!confirm) {
            return;
        }

        setError('');
        setDeleteNoteLoading(true);
        setDeletingId(id);

        try {
            await deleteNote(id);
            setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete note');
        }
        finally {
            setDeleteNoteLoading(false);
            setDeletingId(null);
        }
    }

    return (
        <div>
            <h1>My Notes App</h1>
            <h2>{user?.name}'s dashboard</h2>
            <button onClick={handleLogout} disabled={logoutLoading}>{logoutLoading ? 'Logging out...' : 'Logout'}</button>
            {fetchLoading ? (
                <p>Loading...</p>
            ) : fetchError ? (
                <span>{fetchError}</span>
            ) : (
                <div>
                    <button onClick={handleCreateNew} disabled={newNoteLoading}>{newNoteLoading ? 'Creating new note...' : 'Create new note'}</button>
                    {notes.length === 0 ? (
                        <p>No notes here. Create your first one!</p>
                    ) : (
                        <div>
                            <div>
                                {error && <span>{error}</span>}
                            </div>
                            {notes.map(note => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    isEditing={editingId === note._id}
                                    isDeleting={deletingId === note._id}
                                    onEdit={() => handleNoteEdit(note._id)}
                                    onDelete={() => handleNoteDelete(note._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;