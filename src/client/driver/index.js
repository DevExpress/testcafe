import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';
import embeddingUtils from './embedding-utils';

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, '%testCafeDriver%', { configurable: true, value: Driver });
nativeMethods.objectDefineProperty(window, '%testCafeIframeDriver%', { configurable: true, value: IframeDriver });
nativeMethods.objectDefineProperty(window, '%ScriptExecutionBarrier%', {
    configurable: true,
    value:        ScriptExecutionBarrier
});
nativeMethods.objectDefineProperty(window, '%testCafeEmbeddingUtils%', { configurable: true, value: embeddingUtils });

// eslint-disable-next-line no-undef
hammerhead.on(evalIframeScript, e => initTestCafeClientDrivers(nativeMethods.contentWindowGetter.call(e.iframe), true));
