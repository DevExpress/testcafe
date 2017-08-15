import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';


hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        Driver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeIframeDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        IframeDriver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%ScriptExecutionBarrier%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ScriptExecutionBarrier
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeClientDrivers(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
