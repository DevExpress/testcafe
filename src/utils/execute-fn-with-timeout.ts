import timeLimit from 'time-limit-promise';
import { RunTimeoutError, TestTimeoutError } from '../errors/test-run';

interface ExecutionTimeout {
    timeout: number;
    rejectWith: TestTimeoutError | RunTimeoutError;
}

// This function can finish with reject
export default function executeFnWithTimeout (fn: Function, timeout: ExecutionTimeout | null, ...args: any[]): Promise<void> {
    if (!timeout)
        return fn(...args);
    else if (!timeout.timeout)
        throw timeout.rejectWith;
    else
        return timeLimit(fn(...args), timeout.timeout, { rejectWith: timeout.rejectWith });
}
