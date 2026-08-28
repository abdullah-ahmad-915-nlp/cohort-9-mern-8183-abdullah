const SCHEME_WITH_SLASHES = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;
const NO_SLASH_SCHEMES = /^(mailto|tel|sms):/i;

export function normalizeUrl(rawUrl) {
    const trimmed = rawUrl.trim();
    const hasScheme = SCHEME_WITH_SLASHES.test(trimmed) || NO_SLASH_SCHEMES.test(trimmed);
    const isProtocolRelative = trimmed.startsWith('//');

    if (hasScheme || isProtocolRelative || trimmed === '') {
        return trimmed;
    }

    return `https://${trimmed}`;
}