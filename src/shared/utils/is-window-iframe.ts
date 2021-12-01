import { SharedWindow } from '../types';

export default function isIframeWindow (window: SharedWindow): boolean {
    return !window.parent || window.parent !== window;
}
