import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';
import embeddingUtils from './embedding-utils';


hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeDriver%', {
    enumerable:   false,
    configurable: true,
    writable:     false,
    value:        Driver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeIframeDriver%', {
    enumerable:   false,
    configurable: true,
    writable:     false,
    value:        IframeDriver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%ScriptExecutionBarrier%', {
    enumerable:   false,
    configurable: true,
    writable:     false,
    value:        ScriptExecutionBarrier
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeEmbeddingUtils%', {
    enumerable:   false,
    configurable: true,
    writable:     false,
    value:        embeddingUtils
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeClientDrivers(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
