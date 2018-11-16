import { Promise } from '../deps/hammerhead';
import delay from './delay';
import { timeLimitedPromiseTimeoutExpired } from '../../../errors/runtime/message';


export default function (promise, ms) {
    return Promise.race([promise, delay(ms).then(() => Promise.reject(new Error(timeLimitedPromiseTimeoutExpired)))]);
}
