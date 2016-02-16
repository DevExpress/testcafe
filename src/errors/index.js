import createCallsiteRecord from 'callsite-record';
import { renderers } from 'callsite-record';
import MESSAGE from './message';
import stackFilter from './stack-filter';
import stackCleaningHook from './stack-cleaning-hook';


// Utils
function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}

function getCallsite (methodName, typeName) {
    var stackCleaningEnabled = stackCleaningHook.enabled;

    stackCleaningHook.enabled = false;

    var callsiteRecord = createCallsiteRecord(methodName, typeName);

    stackCleaningHook.enabled = stackCleaningEnabled;

    return callsiteRecord;
}

// Errors
export class GeneralError extends Error {
    constructor () {
        super(getText.apply(null, arguments));
        Error.captureStackTrace(this, GeneralError);

        // HACK: workaround for the `instanceof` problem
        // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
        this.constructor = GeneralError;
    }
}

export class TestCompilationError extends Error {
    constructor (originalError) {
        super(getText(MESSAGE.cannotPrepareTestsDueToError, originalError.toString()));

        // NOTE: stack includes message as well.
        this.stack       = getText(MESSAGE.cannotPrepareTestsDueToError, originalError.stack);
        this.constructor = TestCompilationError;
    }
}

export class GlobalsAPIError extends Error {
    constructor (methodName, typeName, template, ...args) {
        super(getText(template, ...args));

        this.callsiteRecord = getCallsite(methodName, typeName);
        this.constructor    = GlobalsAPIError;

        // HACK: prototype properties don't work with built-in subclasses
        // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
        Object.defineProperty(this, 'stack', {
            get: () => GlobalsAPIError._createStack(this.message, this.callsiteRecord, renderers.noColor)
        });

        Object.defineProperty(this, 'coloredStack', {
            get: () => GlobalsAPIError._createStack(this.message, this.callsiteRecord, renderers.default)
        });
    }

    static _createStack (message, callsiteRecord, renderer) {
        return message + '\n\n' + callsiteRecord.renderSync({ renderer, stackFilter });
    }
}
