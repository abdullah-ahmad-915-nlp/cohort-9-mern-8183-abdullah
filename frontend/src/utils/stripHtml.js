export function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('br').forEach((el) => {
        el.replaceWith(' ');
    });

    const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, tr, td, th, blockquote, pre, div';
    const blockElements = doc.querySelectorAll(blockSelectors);

    blockElements.forEach((el) => {
        el.append(' ');
    });

    const text = doc.body.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
}