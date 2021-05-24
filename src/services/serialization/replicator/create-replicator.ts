import Replicator, { Transform } from 'replicator';
import CustomErrorTransform from './transforms/custom-error-transform';
import BrowserConsoleMessagesTransform from './transforms/browser-console-messages-transform';
import ExecuteClientFunctionCommandBaseTransform from './transforms/execute-client-function-command-base-transform';

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
            new BrowserConsoleMessagesTransform(),
            new ExecuteClientFunctionCommandBaseTransform()
        ]);
}
