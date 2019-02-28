import { renderers } from 'callsite-record';
import TEMPLATES from './templates';
import createStackFilter from '../create-stack-filter';
import { getCallsiteForMethod } from '../get-callsite';
import renderTemplate from '../../utils/render-template';
import { RUNTIME_ERRORS } from '../types';

const ERROR_SEPARATOR = '\n\n';

class ProcessTemplateInstruction {
    constructor (processFn) {
        this.processFn = processFn;
    }
}

// Errors
export class GeneralError extends Error {
    constructor (...args) {
        const code     = args.shift();
        const template = TEMPLATES[code];

        super(renderTemplate(template, ...args));

        Object.assign(this, { code, data: args });
        Error.captureStackTrace(this, GeneralError);
    }
}

export class TestCompilationError extends Error {
    constructor (originalError) {
        const template     = TEMPLATES[RUNTIME_ERRORS.cannotPrepareTestsDueToError];
        const errorMessage = originalError.toString();

        super(renderTemplate(template, errorMessage));

        Object.assign(this, {
            code: RUNTIME_ERRORS.cannotPrepareTestsDueToError,
            data: [ errorMessage ]
        });

        // NOTE: stack includes message as well.
        this.stack = renderTemplate(template, originalError.stack);
    }
}

export class APIError extends Error {
    constructor (methodName, code, ...args) {
        let template = TEMPLATES[code];

        template = APIError._prepareTemplateAndArgsIfNecessary(template, args);

        const rawMessage = renderTemplate(template, ...args);

        super(renderTemplate(TEMPLATES[RUNTIME_ERRORS.cannotPrepareTestsDueToError], rawMessage));

        Object.assign(this, { code, data: args });

        // NOTE: `rawMessage` is used in error substitution if it occurs in test run.
        this.rawMessage  = rawMessage;
        this.callsite    = getCallsiteForMethod(methodName);

        // NOTE: We need property getters here because callsite can be replaced by an external code.
        // See https://github.com/DevExpress/testcafe/blob/v1.0.0/src/compiler/test-file/formats/raw.js#L22
        // Also we can't use an ES6 getter for the 'stack' property, because it will create a getter on the class prototype
        // that cannot override the instance property created by the Error parent class.
        Object.defineProperties(this, {
            'stack': {
                get: () => this._createStack(renderers.noColor)
            },

            'coloredStack': {
                get: () => this._createStack(renderers.default)
            }
        });
    }

    _renderCallsite (renderer) {
        if (!this.callsite)
            return '';

        // NOTE: Callsite will throw during rendering if it can't find a target file for the specified function or method:
        // https://github.com/inikulin/callsite-record/issues/2#issuecomment-223263941
        try {
            return this.callsite.renderSync({
                renderer:    renderer,
                stackFilter: createStackFilter(Error.stackTraceLimit)
            });
        }
        catch (error) {
            return '';
        }
    }

    _createStack (renderer) {
        const renderedCallsite = this._renderCallsite(renderer);

        if (!renderedCallsite)
            return this.message;

        return this.message + ERROR_SEPARATOR + renderedCallsite;
    }

    static _prepareTemplateAndArgsIfNecessary (template, args) {
        const lastArg = args.pop();

        if (lastArg instanceof ProcessTemplateInstruction)
            template = lastArg.processFn(template);
        else
            args.push(lastArg);

        return template;
    }
}

export class ClientFunctionAPIError extends APIError {
    constructor (methodName, instantiationCallsiteName, code, ...args) {
        args.push(new ProcessTemplateInstruction(template => template.replace(/\{#instantiationCallsiteName\}/g, instantiationCallsiteName)));

        super(methodName, code, ...args);
    }
}

export class CompositeError extends Error {
    constructor (errors) {
        super(errors.map(({ message }) => message).join(ERROR_SEPARATOR));

        this.stack = errors.map(({ stack }) => stack).join(ERROR_SEPARATOR);
        this.code  = RUNTIME_ERRORS.compositeArgumentsError;
    }
}
