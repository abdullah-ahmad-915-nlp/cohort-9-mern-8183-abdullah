import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NotebookPen, Save, X, Trash2, Loader2 } from 'lucide-react';
import { createNote, deleteNote, getNoteById, updateNote } from '../services/notesApi.js';
import RichTextEditor from '../components/RichTextEditor.jsx';
import '../styles/NoteEditor.css';
import '../styles/AppHeader.css';
import '../styles/Spinner.css';

function NoteEditor() {
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(isEditMode);
    const [saveLoading, setSaveLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [prevId, setPrevId] = useState(id);

    const navigate = useNavigate();

    const isMutating = saveLoading || deleteLoading;

    if (id !== prevId) {
        setPrevId(id);
        setError('');
        setFetchError('');
        setFetchLoading(isEditMode);

        if (!isEditMode) {
            setTitle('');
            setContent('');
        }
    }

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        let isCurrent = true;

        async function fetchNote() {
            try {
                const note = await getNoteById(id);

                if (!isCurrent) {
                    return;
                }

                setTitle(note.title);
                setContent(note.content);
            }
            catch (err) {
                if (!isCurrent) {
                    return;
                }
                setFetchError(err.response?.data?.error || 'Failed to load note');
            }
            finally {
                if (isCurrent) {
                    setFetchLoading(false);
                }
            }
        }

        fetchNote();

        return () => {
            isCurrent = false;
        };
    }, [id, isEditMode]);

    function handleChangeTitle(e) {
        setTitle(e.target.value);
    }

    async function handleSave() {
        setError('');
        setSaveLoading(true);

        try {
            if (isEditMode) {
                await updateNote(id, { title, content });
            }
            else {
                await createNote(title, content);
            }
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to save note');
        }
        finally {
            setSaveLoading(false);
        }
    }

    function handleCancel() {
        setCancelLoading(true);
        navigate('/dashboard');
        setCancelLoading(false);
    }

    async function handleDelete() {
        const confirm = window.confirm('Are you sure you want to delete this note?');

        if (!confirm) {
            return;
        }

        setError('');
        setDeleteLoading(true);

        try {
            await deleteNote(id);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to delete note');
        }
        finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="note-editor-page">
            <header className="app-header">
                <div className="app-header-brand">
                    <NotebookPen size={24} className="app-header-icon" aria-hidden="true" />
                    <h1>My Notes App</h1>
                </div>
            </header>

            {fetchLoading ? (
                <div className="note-editor-state">
                    <Loader2 size={28} className="spin" aria-hidden="true" />
                    <p>Loading...</p>
                </div>
            ) : fetchError ? (
                <div className="note-editor-state">
                    <span role="alert" className="note-editor-error">{fetchError}</span>
                </div>
            ) : (
                <div className="note-editor-card">
                    <div className="note-editor-toolbar-row">
                        <input
                            type="text"
                            aria-label="Note title"
                            placeholder="Enter Title"
                            value={title}
                            onChange={handleChangeTitle}
                            disabled={isMutating}
                            className="note-editor-title-input"
                        />
                        <div className="note-editor-actions">
                            {isEditMode && (
                                <button onClick={handleDelete} disabled={isMutating} className="btn btn-danger">
                                    <Trash2 size={14} aria-hidden="true" />
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                            <button onClick={handleCancel} disabled={isMutating || cancelLoading} className="btn btn-secondary">
                                <X size={14} aria-hidden="true" />
                                {cancelLoading ? 'Cancelling...' : 'Cancel'}
                            </button>
                            <button onClick={handleSave} disabled={isMutating} className="btn btn-primary">
                                <Save size={14} aria-hidden="true" />
                                {saveLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                    <div>
                        {error && <span role="alert" className="note-editor-error">{error}</span>}
                    </div>
                    <RichTextEditor
                        key={id || 'new'}
                        content={content}
                        onChange={setContent}
                    />
                </div>
            )}
        </div>
    );
}

export default NoteEditor;