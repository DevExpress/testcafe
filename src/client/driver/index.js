import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';


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

Object.defineProperty(window, '%ScriptExecutionBarrier%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ScriptExecutionBarrier
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeClientDrivers(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
