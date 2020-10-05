export default function isIframeWindow (window: Window): boolean {
    return window.top !== window;
}
