// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
export const copyToClipboard = (text) => {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData('Text', text);
    } else if (
        document.queryCommandSupported &&
        document.queryCommandSupported('copy')
    ) {
        const textarea = document.createElement('textarea');
        textarea.textContent = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand('copy'); // Security exception may be thrown by some browsers.
        } catch (ex) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}