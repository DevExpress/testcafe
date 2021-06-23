export default function inCrossDomainIframe (window: Window): boolean {
    try {
        return !window.top.document;
    }
    catch (e) {
        return true;
    }
}
