import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe';


Object.defineProperty(window, '%testCafeDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        Driver
});

Object.defineProperty(window, '%testCafeIframeDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        IframeDriver
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeClientDrivers(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
