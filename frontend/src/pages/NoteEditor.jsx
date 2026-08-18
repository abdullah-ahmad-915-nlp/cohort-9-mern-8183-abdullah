import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createNote, deleteNote, getNoteById, updateNote } from '../services/notesApi.js';
import RichTextEditor from '../components/RichTextEditor.jsx';

function NoteEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const navigate = useNavigate();

    const { id } = useParams();
    const isEditMode = Boolean(id);
    const isMutating = saveLoading || deleteLoading;

    useEffect(() => {
        if (!isEditMode) {
            setFetchLoading(false);
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
    }, [id]);

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
        <div>
            <h1>My Notes App</h1>
            {fetchLoading ? (
                <p>Loading...</p>
            ) : fetchError ? (
                <span>{fetchError}</span>
            ) : (
                <div>
                    <div>
                        <input
                            type="text"
                            aria-label="Note title"
                            placeholder="Enter Title"
                            value={title}
                            onChange={handleChangeTitle}
                            disabled={isMutating}
                        />
                        {isEditMode && (
                            <button onClick={handleDelete} disabled={isMutating}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                        <button onClick={handleCancel} disabled={isMutating || cancelLoading}>
                            {cancelLoading ? 'Cancelling...' : 'Cancel'}
                        </button>
                        <button onClick={handleSave} disabled={isMutating}>
                            {saveLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    <div>
                        {error && <span>{error}</span>}
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