import { writable as isWritableStream } from 'is-stream';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';

function isStreamMock (obj) {
    return obj &&
           typeof obj.write === 'function' &&
           typeof obj.end === 'function';
}

function validateReporterOutput (obj) {
    const isValidReporterOutput = obj === void 0 ||
          typeof obj === 'string' ||
          isWritableStream(obj) ||
          isStreamMock(obj);

    if (!isValidReporterOutput)
        throw new GeneralError(MESSAGE.invalidReporterOutput);
}

export default function (name, outStream) {
    let reporters = [];

    if (name instanceof Array)
        reporters = name.map(r => typeof r === 'string' || typeof r === 'function' ? { name: r } : r);
    else {
        const reporter = { name, outStream };

        reporters.push(reporter);
    }

    reporters.forEach(r => validateReporterOutput(r.outStream));

    return reporters;
}
