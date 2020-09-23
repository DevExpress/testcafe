export default function isWindowInIframe (window: Window): boolean {
    return window.top !== window;
}
