import debug from 'debug';

const testcafeLogger = debug('testcafe');

const proxylessLogger                      = testcafeLogger.extend('proxyless');
const requestPipelineLogger                = proxylessLogger.extend('request-pipeline');
const requestPipelineMockLogger            = requestPipelineLogger.extend('mock');
const requestPipelineInternalRequestLogger = requestPipelineLogger.extend('internal-request');
const requestPipelineServiceRequestLogger  = requestPipelineLogger.extend('service-request');
const requestPipelineOtherRequestLogger    = requestPipelineLogger.extend('other-request');
const resourceInjectorLogger               = proxylessLogger.extend('resource-injector');
const requestHooksLogger                   = proxylessLogger.extend('request-hooks');
const requestHooksEventProviderLogger      = requestHooksLogger.extend('event-provider');

const browserLogger               = testcafeLogger.extend('browser');
const browserProviderLogger       = browserLogger.extend('provider');
const chromeBrowserProviderLogger = browserProviderLogger.extend('chrome');

export {
    proxylessLogger,
    requestPipelineLogger,
    resourceInjectorLogger,
    chromeBrowserProviderLogger,
    requestHooksEventProviderLogger,
    requestPipelineMockLogger,
    requestPipelineInternalRequestLogger,
    requestPipelineServiceRequestLogger,
    requestPipelineOtherRequestLogger,
};
