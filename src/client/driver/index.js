import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';
import embeddingUtils from './embedding-utils';


hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeDriver%', {
    configurable: true,
    value:        Driver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeIframeDriver%', {
    configurable: true,
    value:        IframeDriver
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%ScriptExecutionBarrier%', {
    configurable: true,
    value:        ScriptExecutionBarrier
});

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeEmbeddingUtils%', {
    configurable: true,
    value:        embeddingUtils
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeClientDrivers(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
