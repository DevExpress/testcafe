import { writable as isWritableStream } from 'is-stream';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

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
        throw new GeneralError(RUNTIME_ERRORS.invalidReporterOutput);
}

export default function (name, output) {
    let reporters = [];

    if (name instanceof Array)
        reporters = name.map(r => typeof r === 'string' || typeof r === 'function' ? { name: r } : r);
    else {
        const reporter = { name, output };

        reporters.push(reporter);
    }

    reporters.forEach(r => validateReporterOutput(r.output));

    return reporters;
}
