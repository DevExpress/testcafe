export default function isIframeWindow (window: Window): boolean {
    return !window.parent || window.parent !== window;
}
