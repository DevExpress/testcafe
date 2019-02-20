import { Promise } from '../deps/hammerhead';
import delay from './delay';
import { RUNTIME_ERRORS } from '../../../errors/types';
import TEMPLATES from '../../../errors/runtime/templates';

const timeLimitedPromiseTimeoutExpiredTemplate = TEMPLATES[RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired];

class TimeLimitedPromiseTimeoutExpiredError extends Error {
    constructor () {
        super(timeLimitedPromiseTimeoutExpiredTemplate);

        this.code = RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired;
    }
}

export default function (promise, ms) {
    return Promise.race([promise, delay(ms).then(() => Promise.reject(new TimeLimitedPromiseTimeoutExpiredError()))]);
}
