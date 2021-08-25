import Replicator, { Transform } from 'replicator';
import CustomErrorTransform from './transforms/custom-error-transform';
import BrowserConsoleMessagesTransform from './transforms/browser-console-messages-transform';
import CommandBaseTransform from './transforms/command-base-trasform';
import RequestFilterRuleTransform from './transforms/request-filter-rule-transform';
import ResponseMockTransform from './transforms/response-mock-transform';
import RequestHookEventDataTransform from './transforms/request-hook-event-data-transform';
import ReExecutablePromiseTransform from './transforms/re-executable-promise-transform';
import RoleTransform from './transforms/role-transform';
import CallsiteRecordTransform from './transforms/callsite-record-transform';
import TestCafeErrorListTransform from './transforms/testcafe-error-list-transform';
import FunctionMarkerTransform from './transforms/function-marker-transform';
import PromiseMarkerTransform from './transforms/promise-marker-transform';
import ConfigureResponseEventOptionTransform from './transforms/configure-response-event-option-transform';
import URLTransform from './transforms/url-transform';
import RawCommandCallsiteRecordTransform from './transforms/raw-command-callsite-record-transform';

const DEFAULT_ERROR_TRANSFORM_TYPE = '[[Error]]';

function getDefaultErrorTransform (replicator: Replicator): Transform | undefined {
    return replicator.transforms.find(transform => {
        return transform.type === DEFAULT_ERROR_TRANSFORM_TYPE;
    });
}

export default function (): Replicator {
    // We need to move the 'CustomErrorTransform' transform before the default transform for the 'Error' class
    // to ensure the correct transformation order:
    // TestCafe's and custom errors will be transformed by CustomErrorTransform, built-in errors - by the built-in replicator's transformer.
    const replicator            = new Replicator();
    const defaultErrorTransform = getDefaultErrorTransform(replicator) as Transform;
    const customErrorTransform  = new CustomErrorTransform();

    return replicator
        .removeTransforms(defaultErrorTransform)
        .addTransforms([
            customErrorTransform,
            defaultErrorTransform,
            new URLTransform(),
            new TestCafeErrorListTransform(),
            new BrowserConsoleMessagesTransform(),
            new ReExecutablePromiseTransform(),
            new FunctionMarkerTransform(),
            new PromiseMarkerTransform(),
            new CommandBaseTransform(),
            new RequestFilterRuleTransform(),
            new ConfigureResponseEventOptionTransform(),
            new ResponseMockTransform(),
            new RequestHookEventDataTransform(),
            new RoleTransform(),
            new CallsiteRecordTransform(),
            new RawCommandCallsiteRecordTransform(),
        ]);
}
