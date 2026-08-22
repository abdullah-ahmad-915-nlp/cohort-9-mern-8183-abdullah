import { render, screen } from '@testing-library/react';
import RichTextEditor from '../../../src/components/RichTextEditor.jsx';

jest.mock('tiptap-extension-resize-image', () => {
    const Image = jest.requireActual('@tiptap/extension-image').default;
    return { ImageResize: Image };
});

describe('RichTextEditor', () => {
    it('renders without crashing given content and onChange props', () => {
        render(<RichTextEditor content="<p>hello</p>" onChange={() => {}} />);

        expect(document.querySelector('.ProseMirror')).toBeInTheDocument();
    });

    it('renders the initial content passed in', () => {
        render(<RichTextEditor content="<p>hello world</p>" onChange={() => {}} />);

        expect(screen.getByText('hello world')).toBeInTheDocument();
    });

    it('renders with empty content without crashing', () => {
        render(<RichTextEditor content="" onChange={() => {}} />);

        expect(document.querySelector('.ProseMirror')).toBeInTheDocument();
    });
});