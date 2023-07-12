import debug from 'debug';

const testcafeLogger = debug('testcafe');

const nativeAutomationLogger               = testcafeLogger.extend('native-automation');
const requestPipelineLogger                = nativeAutomationLogger.extend('request-pipeline');
const requestPipelineContextLogger         = requestPipelineLogger.extend('context');
const requestPipelineMockLogger            = requestPipelineLogger.extend('mock');
const requestPipelineInternalRequestLogger = requestPipelineLogger.extend('internal-request');
const requestPipelineServiceRequestLogger  = requestPipelineLogger.extend('service-request');
const requestPipelineOtherRequestLogger    = requestPipelineLogger.extend('other-request');
const resourceInjectorLogger               = nativeAutomationLogger.extend('resource-injector');
const requestHooksLogger                   = nativeAutomationLogger.extend('request-hooks');
const requestHooksEventProviderLogger      = requestHooksLogger.extend('event-provider');

const browserLogger               = testcafeLogger.extend('browser');
const browserProviderLogger       = browserLogger.extend('provider');
const chromeBrowserProviderLogger = browserProviderLogger.extend('chrome');

const runnerLogger = testcafeLogger.extend('runner');

const testRunControllerLogger = runnerLogger.extend('test-run-controller');

const reporterLogger = testcafeLogger.extend('reporter');

const versionLogger = testcafeLogger.extend('version');

export {
    nativeAutomationLogger,
    requestPipelineLogger,
    resourceInjectorLogger,
    chromeBrowserProviderLogger,
    requestHooksEventProviderLogger,
    requestPipelineMockLogger,
    requestPipelineInternalRequestLogger,
    requestPipelineServiceRequestLogger,
    requestPipelineOtherRequestLogger,
    requestPipelineContextLogger,
    testRunControllerLogger,
    reporterLogger,
    versionLogger,
};
