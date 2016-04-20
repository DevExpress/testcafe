import { renderers } from 'callsite-record';
import MESSAGE from './message';
import stackFilter from '../stack-filter';
import getCallsite from '../get-callsite';


// Utils
function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
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
        var text = getText(template, ...args);

        super(getText(MESSAGE.cannotPrepareTestsDueToError, text));

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
