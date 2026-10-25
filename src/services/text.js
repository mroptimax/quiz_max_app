/**
 * Decodes HTML entities (e.g. "&amp;", "&quot;") from API strings into plain text.
 * A textarea never executes markup, so this is safe for untrusted input.
 * @param str
 * @returns string
 */
export function decodeHtml(str) {
    let textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
}
