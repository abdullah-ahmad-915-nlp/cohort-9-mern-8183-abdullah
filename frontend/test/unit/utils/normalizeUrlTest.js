import { normalizeUrl } from '../../../src/utils/normalizeUrl.js';

describe('normalizeUrl', () => {
    it('prepends https:// to a bare domain with no scheme', () => {
        expect(normalizeUrl('react.dev')).toBe('https://react.dev');
    });

    it('leaves a URL that already has http:// unchanged', () => {
        expect(normalizeUrl('http://react.dev')).toBe('http://react.dev');
    });

    it('leaves a URL that already has https:// unchanged', () => {
        expect(normalizeUrl('https://react.dev')).toBe('https://react.dev');
    });

    it('leaves a mailto: link unchanged', () => {
        expect(normalizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('leaves a protocol-relative URL unchanged', () => {
        expect(normalizeUrl('//cdn.example.com/image.png')).toBe('//cdn.example.com/image.png');
    });

    it('trims surrounding whitespace before checking for a scheme', () => {
        expect(normalizeUrl('  react.dev  ')).toBe('https://react.dev');
    });

    it('returns an empty string unchanged', () => {
        expect(normalizeUrl('')).toBe('');
    });
});