function normalizeUrl(rawUrl) {
    const trimmed = rawUrl.trim();
    const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
    const isProtocolRelative = trimmed.startsWith('//');

    if (hasScheme || isProtocolRelative || trimmed === '') {
        return trimmed;
    }

    return `https://${trimmed}`;
}

export { normalizeUrl };