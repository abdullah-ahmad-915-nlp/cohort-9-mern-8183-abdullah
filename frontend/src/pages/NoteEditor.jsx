import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NotebookPen, Save, X, Trash2, Loader2, FileQuestion, ShieldAlert, AlertCircle } from 'lucide-react';
import { createNote, deleteNote, getNoteById, updateNote } from '../services/notesApi.js';
import RichTextEditor from '../components/RichTextEditor.jsx';
import '../styles/NoteEditor.css';
import '../styles/AppHeader.css';
import '../styles/Spinner.css';

// Only these exact backend messages are shown to the user verbatim, each
// paired with an icon that matches the failure. Anything else (including
// raw database/driver errors like a Mongoose CastError) is replaced with a
// generic message so internal error details never leak into the UI.
// A Map (not a plain object) is used deliberately: a plain object literal
// still inherits from Object.prototype, so a rawMessage of "__proto__"
// would resolve to Object.prototype instead of undefined and crash when
// rendered as a component. Map has no such inherited keys.
const KNOWN_FETCH_ERRORS = new Map([
    ['Note not found', FileQuestion],
    ['Not authorized to access this note', ShieldAlert],
    ['Failed to load note', AlertCircle],
]);

function resolveFetchError(rawMessage) {
    const icon = KNOWN_FETCH_ERRORS.get(rawMessage);

    if (icon) {
        return { message: rawMessage, icon };
    }

    return { message: 'Something went wrong', icon: AlertCircle };
}

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

    const navigate = useNavigate();

    const isMutating = saveLoading || deleteLoading;

    // Reset state during render (not inside an effect) when `id` changes,
    // by comparing against the id this component last rendered with. This
    // is React's documented pattern for "adjusting state when a prop
    // changes" (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
    // It replaces the previous effect-based reset and fixes the
    // stale-error-on-note-switch regression covered by NoteEditorTest.jsx's
    // id-change test, without ever calling setState inside an effect body.
    const [prevId, setPrevId] = useState(id);
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
        const confirm = window.confirm('You will lose all current changes. Continue?');

        if (!confirm) {
            return;
        }

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
                    <h1>Noteverse</h1>
                </div>
            </header>

            {fetchLoading ? (
                <div className="note-editor-state">
                    <Loader2 size={28} className="spin" aria-hidden="true" />
                    <p>Loading...</p>
                </div>
            ) : fetchError ? (
                <div className="note-editor-state">
                    {(() => {
                        const { message, icon: ErrorIcon } = resolveFetchError(fetchError);
                        return (
                            <>
                                <ErrorIcon size={40} color="#B4453D" aria-hidden="true" />
                                <span role="alert" className="note-editor-error">{message}</span>
                            </>
                        );
                    })()}
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