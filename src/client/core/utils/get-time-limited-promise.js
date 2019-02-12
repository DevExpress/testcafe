import { Promise } from '../deps/hammerhead';
import delay from './delay';
import { RuntimeErrors } from '../../../errors/types';
import TEMPLATES from '../../../errors/runtime/templates';

const timeLimitedPromiseTimeoutExpiredTemplate = TEMPLATES[RuntimeErrors.timeLimitedPromiseTimeoutExpired];

class TimeLimitedPromiseTimeoutExpiredError extends Error {
    constructor () {
        super(timeLimitedPromiseTimeoutExpiredTemplate);

        this.code = RuntimeErrors.timeLimitedPromiseTimeoutExpired.code;
    }
}

export default function (promise, ms) {
    return Promise.race([promise, delay(ms).then(() => Promise.reject(new TimeLimitedPromiseTimeoutExpiredError()))]);
}
