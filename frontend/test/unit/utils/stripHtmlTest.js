import { stripHtml } from '../../../src/utils/stripHtml.js';

describe('stripHtml', () => {
    it('strips simple tags and returns plain text', () => {
        expect(stripHtml('<p>hello</p>')).toBe('hello');
    });

    it('replaces <br> elements with a space instead of concatenating text', () => {
        expect(stripHtml('<p>hello<br>world</p>')).toBe('hello world');
    });

    it('separates table cell content instead of concatenating it', () => {
        expect(stripHtml('<table><tr><td>A</td><td>B</td></tr></table>')).toBe('A B');
    });

    it('separates table header cells the same way as data cells', () => {
        expect(stripHtml('<table><tr><th>Name</th><th>Age</th></tr></table>')).toBe('Name Age');
    });

    it('separates block-level elements like headings and paragraphs with spaces', () => {
        expect(stripHtml('<h1>Title</h1><p>Body text</p>')).toBe('Title Body text');
    });

    it('separates list items with spaces', () => {
        expect(stripHtml('<ul><li>One</li><li>Two</li></ul>')).toBe('One Two');
    });

    it('separates blockquote and pre content with spaces', () => {
        expect(stripHtml('<blockquote>Quoted</blockquote><pre>code</pre>')).toBe('Quoted code');
    });

    it('collapses repeated whitespace (including newlines) into a single space', () => {
        expect(stripHtml('<p>hello</p>\n\n   <p>world</p>')).toBe('hello world');
    });

    it('strips inline formatting tags with no extra separators added', () => {
        expect(stripHtml('<p><strong>bold</strong> and <em>italic</em></p>')).toBe('bold and italic');
    });

    it('trims leading and trailing whitespace from the result', () => {
        expect(stripHtml('  <p>  padded  </p>  ')).toBe('padded');
    });

    it('returns an empty string for empty or whitespace-only content', () => {
        expect(stripHtml('')).toBe('');
        expect(stripHtml('   ')).toBe('');
    });

    it('handles deeply nested elements correctly', () => {
        expect(stripHtml('<div><p>Outer <span>inner</span> text</p></div>')).toBe('Outer inner text');
    });
});