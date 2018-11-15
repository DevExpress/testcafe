import { Promise } from '../deps/hammerhead';
import delay from './delay';
import { timeLimitedPromiseTimeoutExpired } from '../../../errors/runtime/message';


export default function (promise, ms) {
    let isTimeoutExceeded = false;

    return Promise.race([promise, delay(ms).then(() => {
        isTimeoutExceeded = true;
    })])
        .then(value => {
            if (isTimeoutExceeded)
                Promise.reject(new Error(timeLimitedPromiseTimeoutExpired));
            return value;
        });
}
