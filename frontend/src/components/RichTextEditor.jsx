import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { ImageResize } from 'tiptap-extension-resize-image';

const HIGHLIGHT_COLORS = [
    { label: 'Yellow', value: '#fef08a' },
    { label: 'Green', value: '#bbf7d0' },
    { label: 'Blue', value: '#bfdbfe' },
    { label: 'Pink', value: '#fbcfe8' },
    { label: 'Orange', value: '#fed7aa' },
];

const TABLE_GRID_MAX = 8;
const IMAGE_NODE_NAME = 'imageResize';

const ConfiguredImageResize = ImageResize.configure({
    allowBase64: true,
    minWidth: 50,
    maxWidth: 1200,
});

function RichTextEditor({ content, onChange }) {
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [hoverDims, setHoverDims] = useState({ rows: 0, cols: 0 });
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [, forceUpdate] = useState(0);
    const fileInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
            }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            Link.configure({ openOnClick: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            ConfiguredImageResize,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: () => {
            forceUpdate((n) => n + 1);
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                const { selection } = view.state;
                const isImageSelected = selection.node && selection.node.type.name === IMAGE_NODE_NAME;

                if (isImageSelected) {
                    const allowedKeys = ['Delete', 'Backspace', 'Escape', 'Tab'];
                    if (!allowedKeys.includes(event.key)) {
                        event.preventDefault();
                        return true;
                    }
                }

                return false;
            },
        },
    });

    function handleSetLink() {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl || '');

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }

    function handleInsertImageUrl() {
        const url = window.prompt('Enter image URL');
        setShowImageMenu(false);

        if (!url) {
            return;
        }

        editor.chain().focus().setImage({ src: url }).run();
    }

    function handleUploadImageClick() {
        setShowImageMenu(false);
        fileInputRef.current?.click();
    }

    function handleImageFileChange(e) {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function handleDeleteImage() {
        editor.chain().focus().deleteSelection().run();
    }

    function handleInsertTable(rows, cols) {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run();
        setShowTablePicker(false);
        setHoverDims({ rows: 0, cols: 0 });
    }

    function getCurrentHeadingValue() {
        for (let level = 1; level <= 6; level++) {
            if (editor.isActive('heading', { level })) {
                return String(level);
            }
        }
        return 'heading';
    }

    function handleHeadingChange(e) {
        const value = e.target.value;
        if (value === 'heading') {
            editor.chain().focus().setParagraph().run();
        }
        else {
            editor.chain().focus().toggleHeading({ level: Number(value) }).run();
        }
    }

    function getCurrentListValue() {
        if (editor.isActive('bulletList')) {
            return 'bullet';
        }

        if (editor.isActive('orderedList')) {
            return 'ordered';
        }

        if (editor.isActive('taskList')) {
            return 'task';
        }

        return '';
    }

    function handleListChange(e) {
        const value = e.target.value;
        if (value === 'bullet') {
            editor.chain().focus().toggleBulletList().run();
        }
        else if (value === 'ordered') {
            editor.chain().focus().toggleOrderedList().run();
        }
        else if (value === 'task') {
            editor.chain().focus().toggleTaskList().run();
        }
    }

    function handleFocusEditor() {
        editor?.commands.focus();
    }

    if (!editor) {
        return null;
    }

    return (
        <div>
            <div className="toolbar">
                <div className="toolbar-group">
                    <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">Undo</button>
                    <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">Redo</button>
                </div>

                <div className="toolbar-group">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().toggleBold()} title="Bold (Ctrl+B)">Bold</button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().toggleItalic()} title="Italic (Ctrl+I)">Italic</button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().toggleUnderline()} title="Underline (Ctrl+U)">Underline</button>
                    <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().toggleStrike()} title="Strikethrough">Strikethrough</button>
                    <select
                        onChange={(e) => {
                            const color = e.target.value;
                            if (color === '') {
                                editor.chain().focus().unsetHighlight().run();
                            }
                            else {
                                editor.chain().focus().setHighlight({ color }).run();
                            }
                        }}
                        value={editor.getAttributes('highlight').color || ''}
                        title="Highlight color"
                    >
                        <option value="">Highlight</option>
                        {HIGHLIGHT_COLORS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                    <button onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().toggleCode()} title="Inline Code">Inline Code</button>
                </div>

                <div className="toolbar-group">
                    <select onChange={handleHeadingChange} value={getCurrentHeadingValue()} title="Heading level">
                        <option value="heading">Heading</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                        <option value="5">Heading 5</option>
                        <option value="6">Heading 6</option>
                    </select>
                    <select onChange={handleListChange} value={getCurrentListValue()} title="List type">
                        <option value="">List</option>
                        <option value="bullet">Bullet List</option>
                        <option value="ordered">Numbered List</option>
                        <option value="task">Task List</option>
                    </select>
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote (Ctrl+Shift+B)">Blockquote</button>
                    <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block (Ctrl+Alt+C)">Code Block</button>
                </div>

                <div className="toolbar-group">
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">Left</button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">Center</button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">Right</button>
                    <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">Justify</button>
                </div>

                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <button onClick={handleSetLink} title="Insert Link">Link</button>
                    <button onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove Link">Unlink</button>

                    <button onClick={() => setShowImageMenu((v) => !v)} title="Insert Image">Image</button>
                    {showImageMenu && (
                        <div className="dropdown-menu">
                            <button onClick={handleInsertImageUrl}>From URL</button>
                            <button onClick={handleUploadImageClick}>Upload from device</button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                    />

                    <button onClick={() => setShowTablePicker((v) => !v)} title="Insert Table">Table</button>
                    {showTablePicker && (
                        <div className="dropdown-menu">
                            <div className="table-grid-label">
                                {hoverDims.rows > 0 ? `${hoverDims.rows} x ${hoverDims.cols}` : 'Select size'}
                            </div>
                            <div className="table-grid">
                                {Array.from({ length: TABLE_GRID_MAX }).map((_, rowIndex) => (
                                    <div key={rowIndex} className="table-grid-row">
                                        {Array.from({ length: TABLE_GRID_MAX }).map((_, colIndex) => {
                                            const isHighlighted = rowIndex < hoverDims.rows && colIndex < hoverDims.cols;
                                            return (
                                                <div
                                                    key={colIndex}
                                                    className={isHighlighted ? 'table-grid-cell active' : 'table-grid-cell'}
                                                    onMouseEnter={() => setHoverDims({ rows: rowIndex + 1, cols: colIndex + 1 })}
                                                    onClick={() => handleInsertTable(rowIndex + 1, colIndex + 1)}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="toolbar context-toolbar-row">
                {editor.isActive('table') && (
                    <div className="toolbar-group">
                        <button onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row</button>
                        <button onClick={() => editor.chain().focus().deleteRow().run()}>Delete Row</button>
                        <button onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Column</button>
                        <button onClick={() => editor.chain().focus().deleteColumn().run()}>Delete Column</button>
                        <button onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge Cells</button>
                        <button onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>Split Cell</button>
                        <button onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</button>
                    </div>
                )}
                {editor.isActive(IMAGE_NODE_NAME) && (
                    <div className="toolbar-group">
                        <button onClick={handleDeleteImage}>Delete Image</button>
                    </div>
                )}
            </div>

            <div className="editor-content" onClick={handleFocusEditor}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default RichTextEditor;