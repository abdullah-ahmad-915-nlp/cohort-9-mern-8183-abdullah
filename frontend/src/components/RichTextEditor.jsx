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
import '../styles/RichTextEditor.css';
import {
    Undo2, Redo2,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, Code,
    Heading, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Pilcrow,
    List, ListOrdered, ListTodo, Quote, SquareCode,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link2, Unlink2,
    ImagePlus, ImageMinus,
    Grid2x2Plus, Grid2x2X, Rows3, Columns3, TableCellsMerge, TableCellsSplit,
    Plus, Minus, Globe, Upload, Ban, ChevronDown,
} from 'lucide-react';

const HIGHLIGHT_COLORS = [
    { label: 'Yellow', value: '#fef08a' },
    { label: 'Green', value: '#bbf7d0' },
    { label: 'Blue', value: '#bfdbfe' },
    { label: 'Pink', value: '#fbcfe8' },
    { label: 'Orange', value: '#fed7aa' },
];

const HEADING_LEVELS = [
    { level: 1, icon: Heading1, label: 'Heading 1' },
    { level: 2, icon: Heading2, label: 'Heading 2' },
    { level: 3, icon: Heading3, label: 'Heading 3' },
    { level: 4, icon: Heading4, label: 'Heading 4' },
    { level: 5, icon: Heading5, label: 'Heading 5' },
    { level: 6, icon: Heading6, label: 'Heading 6' },
];

const TABLE_GRID_MAX = 8;
const IMAGE_NODE_NAME = 'imageResize';

const ConfiguredImageResize = ImageResize.configure({
    allowBase64: true,
    minWidth: 50,
    maxWidth: 1200,
});

function ToolbarButton({ icon: Icon, label, onClick, disabled, active }) {
    return (
        <button
            type="button"
            className={active ? 'toolbar-btn is-active' : 'toolbar-btn'}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
        >
            <Icon size={16} aria-hidden="true" />
        </button>
    );
}

function ToolbarButtonDual({ icon: Icon, badge: Badge, label, onClick, disabled }) {
    return (
        <button
            type="button"
            className="toolbar-btn toolbar-btn-dual"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
        >
            <Icon size={16} aria-hidden="true" />
            <span className="toolbar-btn-badge">
                <Badge size={10} aria-hidden="true" strokeWidth={3} />
            </span>
        </button>
    );
}

function IconDropdownTrigger({ icon: Icon, label, onClick, active }) {
    return (
        <button
            type="button"
            className={active ? 'toolbar-btn icon-dropdown-trigger is-active' : 'toolbar-btn icon-dropdown-trigger'}
            onClick={onClick}
            title={label}
            aria-label={label}
        >
            <Icon size={16} aria-hidden="true" />
            <ChevronDown size={10} aria-hidden="true" className="icon-dropdown-chevron" />
        </button>
    );
}

function RichTextEditor({ content, onChange }) {
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [hoverDims, setHoverDims] = useState({ rows: 0, cols: 0 });
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [showListMenu, setShowListMenu] = useState(false);
    const [, forceUpdate] = useState(0);
    const fileInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                link: false,
                underline: false,
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

    function getCurrentHeadingIcon() {
        for (const { level, icon } of HEADING_LEVELS) {
            if (editor.isActive('heading', { level })) {
                return icon;
            }
        }
        return Heading;
    }

    function handleSelectHeading(level) {
        editor.chain().focus().toggleHeading({ level }).run();
        setShowHeadingMenu(false);
    }

    function handleClearHeading() {
        editor.chain().focus().setParagraph().run();
        setShowHeadingMenu(false);
    }

    function getCurrentListIcon() {
        if (editor.isActive('orderedList')) {
            return ListOrdered;
        }

        if (editor.isActive('taskList')) {
            return ListTodo;
        }

        return List;
    }

    function handleSelectBulletList() {
        editor.chain().focus().toggleBulletList().run();
        setShowListMenu(false);
    }

    function handleSelectOrderedList() {
        editor.chain().focus().toggleOrderedList().run();
        setShowListMenu(false);
    }

    function handleSelectTaskList() {
        editor.chain().focus().toggleTaskList().run();
        setShowListMenu(false);
    }

    function handleSelectHighlight(color) {
        editor.chain().focus().setHighlight({ color }).run();
        setShowHighlightMenu(false);
    }

    function handleClearHighlight() {
        editor.chain().focus().unsetHighlight().run();
        setShowHighlightMenu(false);
    }

    function handleFocusEditor() {
        editor?.commands.focus();
    }

    if (!editor) {
        return null;
    }

    const isTableActive = editor.isActive('table');
    const isImageActive = editor.isActive(IMAGE_NODE_NAME);

    return (
        <div>
            <div className="toolbar">
                <div className="toolbar-group">
                    <ToolbarButton icon={Undo2} label="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
                    <ToolbarButton icon={Redo2} label="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={Bold} label="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().toggleBold()} active={editor.isActive('bold')} />
                    <ToolbarButton icon={Italic} label="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().toggleItalic()} active={editor.isActive('italic')} />
                    <ToolbarButton icon={UnderlineIcon} label="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().toggleUnderline()} active={editor.isActive('underline')} />
                    <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().toggleStrike()} active={editor.isActive('strike')} />
                    <div className="icon-dropdown">
                        <IconDropdownTrigger
                            icon={Highlighter}
                            label="Highlight color"
                            onClick={() => setShowHighlightMenu((v) => !v)}
                            active={editor.isActive('highlight')}
                        />
                        {showHighlightMenu && (
                            <div className="dropdown-menu dropdown-menu-row">
                                {HIGHLIGHT_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className="highlight-swatch"
                                        style={{ backgroundColor: c.value }}
                                        title={c.label}
                                        aria-label={c.label}
                                        onClick={() => handleSelectHighlight(c.value)}
                                    />
                                ))}
                                <span className="icon-dropdown-divider" aria-hidden="true" />
                                <button
                                    type="button"
                                    className="highlight-swatch highlight-swatch-none"
                                    title="No highlight"
                                    aria-label="No highlight"
                                    onClick={handleClearHighlight}
                                >
                                    <Ban size={14} aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                    <ToolbarButton icon={Code} label="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().toggleCode()} active={editor.isActive('code')} />
                </div>

                <div className="toolbar-group">
                    <div className="icon-dropdown">
                        <IconDropdownTrigger
                            icon={getCurrentHeadingIcon()}
                            label="Heading level"
                            onClick={() => setShowHeadingMenu((v) => !v)}
                            active={editor.isActive('heading')}
                        />
                        {showHeadingMenu && (
                            <div className="dropdown-menu">
                                {HEADING_LEVELS.map(({ level, icon: LevelIcon, label }) => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={editor.isActive('heading', { level }) ? 'icon-option is-active' : 'icon-option'}
                                        title={label}
                                        aria-label={label}
                                        onClick={() => handleSelectHeading(level)}
                                    >
                                        <LevelIcon size={16} aria-hidden="true" />
                                    </button>
                                ))}
                                <span className="icon-dropdown-divider" aria-hidden="true" />
                                <button
                                    type="button"
                                    className="icon-option"
                                    title="Paragraph (remove heading)"
                                    aria-label="Paragraph (remove heading)"
                                    onClick={handleClearHeading}
                                >
                                    <Pilcrow size={16} aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="icon-dropdown">
                        <IconDropdownTrigger
                            icon={getCurrentListIcon()}
                            label="List type"
                            onClick={() => setShowListMenu((v) => !v)}
                            active={editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')}
                        />
                        {showListMenu && (
                            <div className="dropdown-menu">
                                <button
                                    type="button"
                                    className={editor.isActive('bulletList') ? 'icon-option is-active' : 'icon-option'}
                                    title="Bullet List"
                                    aria-label="Bullet List"
                                    onClick={handleSelectBulletList}
                                >
                                    <List size={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={editor.isActive('orderedList') ? 'icon-option is-active' : 'icon-option'}
                                    title="Numbered List"
                                    aria-label="Numbered List"
                                    onClick={handleSelectOrderedList}
                                >
                                    <ListOrdered size={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={editor.isActive('taskList') ? 'icon-option is-active' : 'icon-option'}
                                    title="Task List"
                                    aria-label="Task List"
                                    onClick={handleSelectTaskList}
                                >
                                    <ListTodo size={16} aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                    <ToolbarButton icon={Quote} label="Blockquote (Ctrl+Shift+B)" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
                    <ToolbarButton icon={SquareCode} label="Code Block (Ctrl+Alt+C)" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
                    <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
                    <ToolbarButton icon={AlignRight} label="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
                    <ToolbarButton icon={AlignJustify} label="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
                </div>

                <div className="toolbar-group">
                    <ToolbarButton icon={Link2} label="Insert Link" onClick={handleSetLink} active={editor.isActive('link')} />
                    <ToolbarButton icon={Unlink2} label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} />
                </div>

                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <ToolbarButton icon={ImagePlus} label="Add Image" onClick={() => setShowImageMenu((v) => !v)} />
                    {showImageMenu && (
                        <div className="dropdown-menu">
                            <button className="dropdown-menu-item" onClick={handleInsertImageUrl}>
                                <Globe size={14} aria-hidden="true" />
                                From URL
                            </button>
                            <button className="dropdown-menu-item" onClick={handleUploadImageClick}>
                                <Upload size={14} aria-hidden="true" />
                                Upload from device
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                    />
                    <ToolbarButton icon={ImageMinus} label="Delete Image" onClick={handleDeleteImage} disabled={!isImageActive} />
                </div>

                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <ToolbarButton icon={Grid2x2Plus} label="Add Table" onClick={() => setShowTablePicker((v) => !v)} />
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
                                                <button
                                                    key={colIndex}
                                                    type="button"
                                                    className={isHighlighted ? 'table-grid-cell active' : 'table-grid-cell'}
                                                    aria-label={`Insert table ${rowIndex + 1} by ${colIndex + 1}`}
                                                    onMouseEnter={() => setHoverDims({ rows: rowIndex + 1, cols: colIndex + 1 })}
                                                    onFocus={() => setHoverDims({ rows: rowIndex + 1, cols: colIndex + 1 })}
                                                    onClick={() => handleInsertTable(rowIndex + 1, colIndex + 1)}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <ToolbarButton icon={Grid2x2X} label="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!isTableActive} />
                    <ToolbarButtonDual icon={Rows3} badge={Plus} label="Add Row" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!isTableActive} />
                    <ToolbarButtonDual icon={Rows3} badge={Minus} label="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!isTableActive} />
                    <ToolbarButtonDual icon={Columns3} badge={Plus} label="Add Column" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!isTableActive} />
                    <ToolbarButtonDual icon={Columns3} badge={Minus} label="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!isTableActive} />
                    <ToolbarButton icon={TableCellsMerge} label="Merge Cells" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!isTableActive || !editor.can().mergeCells()} />
                    <ToolbarButton icon={TableCellsSplit} label="Split Cell" onClick={() => editor.chain().focus().splitCell().run()} disabled={!isTableActive || !editor.can().splitCell()} />
                </div>
            </div>

            <div className="editor-content" onClick={handleFocusEditor}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default RichTextEditor;