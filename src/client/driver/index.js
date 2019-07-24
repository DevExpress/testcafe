import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import ScriptExecutionBarrier from './script-execution-barrier';
import embeddingUtils from './embedding-utils';
import INTERNAL_PROPERTIES from './internal-properties';

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeDriver, { configurable: true, value: Driver });
nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeIframeDriver, { configurable: true, value: IframeDriver });
nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.scriptExecutionBarrier, {
    configurable: true,
    value:        ScriptExecutionBarrier
});
nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeEmbeddingUtils, { configurable: true, value: embeddingUtils });

// eslint-disable-next-line no-undef
hammerhead.on(evalIframeScript, e => initTestCafeClientDrivers(nativeMethods.contentWindowGetter.call(e.iframe), true));
