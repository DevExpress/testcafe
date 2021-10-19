import hammerhead from './deps/hammerhead';
import Driver from './driver';
import IframeDriver from './iframe-driver';
import embeddingUtils from './embedding-utils';
import INTERNAL_PROPERTIES from './internal-properties';
import { initializeAdapter as initializeClientFunctionAdapter } from './command-executors/client-functions/adapter';
import clientFunctionAdapterInitializer from './command-executors/client-functions/adapter/initializer';
import { initializeAdapter as initializeSharedAdapter } from '../../shared/adapter';
import sharedAdapterInitializer from './shared-adapter-initializer';


initializeClientFunctionAdapter(clientFunctionAdapterInitializer);
initializeSharedAdapter(sharedAdapterInitializer);

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeDriver, { configurable: true, value: Driver });
nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeIframeDriver, { configurable: true, value: IframeDriver });
nativeMethods.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeEmbeddingUtils, { configurable: true, value: embeddingUtils });

// eslint-disable-next-line no-undef
hammerhead.on(evalIframeScript, e => initTestCafeClientDrivers(nativeMethods.contentWindowGetter.call(e.iframe), true));
