function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    div.querySelectorAll('br').forEach((el) => {
        el.replaceWith(' ');
    });

    const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, tr, td, th, blockquote, pre, div';
    const blockElements = div.querySelectorAll(blockSelectors);

    blockElements.forEach((el) => {
        el.insertAdjacentText('beforeend', ' ');
    });

    const text = div.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
}

export { stripHtml };