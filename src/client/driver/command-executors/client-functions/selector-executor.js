import { Promise } from '../../deps/hammerhead';
import { delay } from '../../deps/testcafe-core';
import { ProgressPanel } from '../../deps/testcafe-ui';
import ClientFunctionExecutor from './client-function-executor';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';

const CHECK_ELEMENT_DELAY = 200;
const PROGRESS_PANEL_TEXT = 'Waiting for an element to appear';

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, elementAvailabilityTimeout) {
        super(command);

        this.elementAvailabilityTimeout = elementAvailabilityTimeout;
    }

    _createReplicator () {
        return createReplicator([
            new SelectorNodeTransform(),
            new FunctionTransform()
        ]);
    }

    _executeFn (fn, args) {
        var startTime     = new Date();
        var progressPanel = new ProgressPanel();

        progressPanel.show(PROGRESS_PANEL_TEXT, this.elementAvailabilityTimeout);

        var createElementPromise = () => {
            return Promise.resolve()
                .then(() => fn.apply(window, args))
                .catch(err => {
                    progressPanel.close(false);
                    throw err;
                })
                .then(el => {
                    var timeout = new Date() - startTime >= this.elementAvailabilityTimeout;

                    if (!timeout && (el === null || el === void 0))
                        return delay(CHECK_ELEMENT_DELAY).then(createElementPromise);

                    progressPanel.close(!!el);

                    return el;
                });
        };

        return createElementPromise();
    }
}
