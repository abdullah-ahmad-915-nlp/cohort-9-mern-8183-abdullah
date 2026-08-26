import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { NotebookPen, LogOut, Plus, FileText, Loader2, Search, X, ArrowUpDown, SearchX, ChevronDown, Check } from 'lucide-react';
import { getNotes, deleteNote } from '../services/notesApi.js';
import NoteCard from '../components/NoteCard.jsx';
import { stripHtml } from '../utils/stripHtml.js';
import '../styles/Dashboard.css';
import '../styles/AppHeader.css';
import '../styles/Spinner.css';

const SORT_OPTIONS = [
    { value: 'updatedAt-desc', label: 'Newest updated first' },
    { value: 'updatedAt-asc', label: 'Oldest updated first' },
    { value: 'title-asc', label: 'A to Z' },
    { value: 'title-desc', label: 'Z to A' },
];

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [deleteErrors, setDeleteErrors] = useState(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt-desc');
    const [showSortMenu, setShowSortMenu] = useState(false);

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

    function handleSearchChange(e) {
        setSearchQuery(e.target.value);
    }

    function handleClearSearch() {
        setSearchQuery('');
    }

    function handleSelectSort(value) {
        setSortBy(value);
        setShowSortMenu(false);
    }

    const trimmedQuery = searchQuery.trim().toLowerCase();

    const searchedNotes = trimmedQuery
        ? notes.filter((note) => {
            const titleMatch = note.title.toLowerCase().includes(trimmedQuery);
            const contentMatch = stripHtml(note.content).toLowerCase().includes(trimmedQuery);
            return titleMatch || contentMatch;
        })
        : notes;

    const visibleNotes = [...searchedNotes].sort((a, b) => {
        switch (sortBy) {
            case 'updatedAt-asc':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'updatedAt-desc':
            default:
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });

    return (
        <div className="dashboard">
            <header className="app-header">
                <div className="app-header-brand">
                    <NotebookPen size={24} className="app-header-icon" aria-hidden="true" />
                    <h1>Noteverse</h1>
                </div>
                <div className="dashboard-user">
                    <span className="dashboard-user-name">{user?.name}'s dashboard</span>
                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="btn btn-secondary"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        {logoutLoading ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </header>

            {fetchLoading ? (
                <div className="dashboard-state">
                    <Loader2 size={28} className="spin" aria-hidden="true" />
                    <p>Loading...</p>
                </div>
            ) : fetchError ? (
                <div className="dashboard-state">
                    <span role="alert" className="dashboard-error">{fetchError}</span>
                </div>
            ) : (
                <div className="dashboard-content">
                    <div className="dashboard-toolbar">
                        <div className="dashboard-filters">
                            <div className="search-input">
                                <Search size={16} aria-hidden="true" className="search-input-icon" />
                                <input
                                    type="text"
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    aria-label="Search notes by title or content"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="search-input-clear"
                                        onClick={handleClearSearch}
                                        aria-label="Clear search"
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <div className="sort-dropdown">
                                <button
                                    type="button"
                                    className="sort-dropdown-trigger"
                                    onClick={() => setShowSortMenu((v) => !v)}
                                    aria-label="Sort notes"
                                >
                                    <ArrowUpDown size={16} aria-hidden="true" />
                                    <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                                    <ChevronDown size={14} aria-hidden="true" className="sort-dropdown-chevron" />
                                </button>
                                {showSortMenu && (
                                    <div className="dropdown-menu sort-dropdown-panel">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={option.value === sortBy ? 'sort-option is-active' : 'sort-option'}
                                                onClick={() => handleSelectSort(option.value)}
                                            >
                                                {option.label}
                                                {option.value === sortBy && (
                                                    <Check size={14} aria-hidden="true" className="sort-option-check" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleCreateNew} className="btn btn-primary">
                            <Plus size={16} aria-hidden="true" />
                            Create new note
                        </button>
                    </div>
                    {notes.length === 0 ? (
                        <div className="dashboard-empty">
                            <FileText size={40} className="dashboard-empty-icon" aria-hidden="true" />
                            <p>No notes here. Create your first one!</p>
                        </div>
                    ) : visibleNotes.length === 0 ? (
                        <div className="dashboard-empty">
                            <SearchX size={40} className="dashboard-empty-icon" aria-hidden="true" />
                            <p>No notes match "{searchQuery.trim()}".</p>
                        </div>
                    ) : (
                        <div className="note-grid">
                            {visibleNotes.map(note => (
                                <div key={note._id} className="note-grid-item">
                                    {deleteErrors.has(note._id) && (
                                        <span role="alert" className="dashboard-error note-error">
                                            {deleteErrors.get(note._id)}
                                        </span>
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