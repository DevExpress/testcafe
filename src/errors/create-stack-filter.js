import isInternalStackFrame from './is-internal-stack-frame';

export default function createStackFilter (limit) {
    let passedFramesCount = 0;

    return function stackFilter (frame) {
        if (passedFramesCount >= limit)
            return false;

        const pass = !isInternalStackFrame(frame);

        if (pass)
            passedFramesCount++;

        return pass;
    };
}
