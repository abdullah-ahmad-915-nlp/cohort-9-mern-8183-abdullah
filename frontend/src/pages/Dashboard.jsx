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
    const [logoutError, setLogoutError] = useState('');
    const [deletingIds, setDeletingIds] = useState(new Set());

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

    async function handleLogout() {
        setLogoutError('');
        setLogoutLoading(true);
        try {
            await logout();
        }
        catch (err) {
            setLogoutError(err.response?.data?.error || 'Failed to logout');
        }
        finally {
            setLogoutLoading(false);
        }
    }

    function handleCreateNew() {
        navigate('/notes/new');
    }

    function handleNoteEdit(id) {
        navigate(`/notes/${id}`);
    }

    async function handleNoteDelete(id) {
        const confirm = window.confirm('Are you sure you want to delete this note?');

        if (!confirm) {
            return;
        }

        setError('');
        setDeletingIds((prev) => new Set(prev).add(id));

        try {
            await deleteNote(id);
            setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete note');
        }
        finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    return (
        <div>
            <h1>My Notes App</h1>
            <h2>{user?.name}'s dashboard</h2>
            <button onClick={handleLogout} disabled={logoutLoading}>{logoutLoading ? 'Logging out...' : 'Logout'}</button>
            {logoutError && <span role="alert">{logoutError}</span>}
            {fetchLoading ? (
                <p>Loading...</p>
            ) : fetchError ? (
                <span role="alert">{fetchError}</span>
            ) : (
                <div>
                    <button onClick={handleCreateNew}>Create new note</button>
                    {notes.length === 0 ? (
                        <p>No notes here. Create your first one!</p>
                    ) : (
                        <div>
                            <div>
                                {error && <span role="alert">{error}</span>}
                            </div>
                            {notes.map(note => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    isDeleting={deletingIds.has(note._id)}
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