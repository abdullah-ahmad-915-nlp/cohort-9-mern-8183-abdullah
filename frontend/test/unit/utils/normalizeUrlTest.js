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

    it('prepends https:// to a bare host:port instead of mistaking the host for a scheme', () => {
        expect(normalizeUrl('localhost:3000')).toBe('https://localhost:3000');
    });

    it('prepends https:// to a domain with a port instead of mistaking it for a scheme', () => {
        expect(normalizeUrl('example.com:8080')).toBe('https://example.com:8080');
    });

    it('leaves a tel: link unchanged', () => {
        expect(normalizeUrl('tel:+15551234567')).toBe('tel:+15551234567');
    });
});