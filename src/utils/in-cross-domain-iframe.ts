export default function inCrossDomainIframe (window: Window): boolean {
    try {
        return !window.parent.document;
    }
    catch (e) {
        return true;
    }
}
