import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getNotes, deleteNote } from '../services/notesApi.js';
import NoteCard from '../components/NoteCard.jsx';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [deleteErrors, setDeleteErrors] = useState(new Map());

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
        setLogoutLoading(true);
        try {
            await logout();
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

        setDeleteErrors((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
        setDeletingIds((prev) => new Set(prev).add(id));

        try {
            await deleteNote(id);
            setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
        }
        catch (err) {
            setDeleteErrors((prev) => {
                const next = new Map(prev);
                next.set(id, err.response?.data?.error || 'Failed to delete note');
                return next;
            });
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
                            {notes.map(note => (
                                <div key={note._id}>
                                    {deleteErrors.has(note._id) && (
                                        <span role="alert">{deleteErrors.get(note._id)}</span>
                                    )}
                                    <NoteCard
                                        note={note}
                                        isDeleting={deletingIds.has(note._id)}
                                        onEdit={() => handleNoteEdit(note._id)}
                                        onDelete={() => handleNoteDelete(note._id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;