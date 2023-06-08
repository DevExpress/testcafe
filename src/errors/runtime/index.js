import TEMPLATES from './templates';
import createStackFilter from '../create-stack-filter';
import { getCallsiteForError, getCallsiteForMethod } from '../get-callsite';
import renderTemplate from '../../utils/render-template';
import renderCallsiteSync from '../../utils/render-callsite-sync';
import { RUNTIME_ERRORS } from '../types';
import getRenderers from '../../utils/get-renderes';
import util from 'util';
import semver from 'semver';
import { removePreventModuleCachingSuffix } from '../test-run/utils';
import REPORTER_MODULE_PREFIX from '../../reporter/module-prefix';

const ERROR_SEPARATOR        = '\n\n';
const NO_STACK_AVAILABLE_MSG = 'No stack trace is available for this error';
const MODULE_NOT_FOUND_CODE  = 'MODULE_NOT_FOUND';

function formatErrorWithCallsite (error) {
    const callsite         = getCallsiteForError(error);
    const stackFilter      = createStackFilter();
    const formattedMessage = callsite?.renderSync({ stackFilter }) || NO_STACK_AVAILABLE_MSG;

    return `${error.message}\n\n${formattedMessage}`;
}

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

    static isGeneralError (arg) {
        return arg instanceof GeneralError;
    }
}

export class TestCompilationError extends Error {
    constructor (originalError) {
        const template     = TEMPLATES[RUNTIME_ERRORS.cannotPrepareTestsDueToError];
        const errorMessage = removePreventModuleCachingSuffix(originalError.toString());

        super(renderTemplate(template, errorMessage));

        Object.assign(this, {
            code: RUNTIME_ERRORS.cannotPrepareTestsDueToError,
            data: [errorMessage],
        });

        // NOTE: The stack includes the error message.
        this.stack = renderTemplate(template, removePreventModuleCachingSuffix(originalError.stack));
    }
}

export class APIError extends Error {
    constructor (callsite, code, ...args) {
        let template = TEMPLATES[code];

        template = APIError._prepareTemplateAndArgsIfNecessary(template, args);

        const rawMessage = renderTemplate(template, ...args);

        super(renderTemplate(TEMPLATES[RUNTIME_ERRORS.cannotPrepareTestsDueToError], rawMessage));

        Object.assign(this, { code, data: args });

        // NOTE: `rawMessage` is used in error substitution if it occurs in test run.
        this.rawMessage = rawMessage;

        if (typeof callsite === 'object')
            this.callsite = callsite;
        else
            this.callsite = getCallsiteForMethod(callsite);

        // NOTE: Property getters are necessary because the callsite can be replaced with external code.
        // See https://github.com/DevExpress/testcafe/blob/v1.0.0/src/compiler/test-file/formats/raw.js#L22
        // Also we can't use an ES6 getter for the 'stack' property, because it will create a getter on the class prototype
        // that cannot override the instance property created by the Error parent class.
        const renderers = getRenderers(this.callsite);

        Object.defineProperties(this, {
            'stack': {
                get: () => this._createStack(renderers.noColor),
            },

            'coloredStack': {
                get: () => this._createStack(renderers.default),
            },
        });
    }

    _createStack (renderer) {
        const renderedCallsite = renderCallsiteSync(this.callsite, {
            renderer:    renderer,
            stackFilter: createStackFilter(Error.stackTraceLimit),
        });

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

export class ReporterPluginError extends GeneralError {
    constructor ({ name, method, originalError }) {
        const code          = RUNTIME_ERRORS.uncaughtErrorInReporter;
        const preparedStack = ReporterPluginError._prepareStack(originalError);

        super(code, method, name, preparedStack);
    }

    static _prepareStack (err) {
        if (!err?.stack) {
            const inspectedObject = util.inspect(err);

            return `No stack trace is available for the raised error.\nError object inspection:\n${inspectedObject}`;
        }

        return err.stack;
    }

}

export class TimeoutError extends GeneralError {
    constructor () {
        super(RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired);
    }
}

export class BrowserConnectionError extends GeneralError {
    constructor (...args) {
        super(RUNTIME_ERRORS.browserConnectionError, ...args);
    }
}

export class RequestRuntimeError extends APIError {
    constructor (methodName, code, ...args) {
        super(methodName, code, ...args);
    }
}

export class SkipJsErrorsArgumentApiError extends APIError {
    constructor (code, ...args) {
        super('skipJsErrors', code, ...args);
    }
}

export class ImportESMInCommonJSError extends GeneralError {
    constructor (originalError, targetFile) {
        const esModule = ImportESMInCommonJSError._getESModule(originalError);

        super(RUNTIME_ERRORS.cannotImportESMInCommonsJS, esModule, targetFile);
    }

    static _getESModule (err) {
        const regExp       = semver.gte(process.version, '16.0.0') ? new RegExp(/ES Module (\S*)/) : /ES Module: (\S*)/;
        const [, esModule] = err.toString().match(regExp);

        return esModule;
    }
}

export class ReadConfigFileError extends GeneralError {
    constructor (code, originalError, filePath, renderCallsite) {
        super(code, filePath, ReadConfigFileError._getFormattedMessage(originalError, renderCallsite));
    }

    static _getFormattedMessage (originalError, renderCallsite) {
        if (!renderCallsite)
            return originalError.message;

        return formatErrorWithCallsite(originalError);
    }
}

export class LoadReporterError extends GeneralError {
    constructor (originalError, reporterFullName) {
        const reporterShortName      = LoadReporterError._ensureShortName(reporterFullName);
        const formattedOriginalError = LoadReporterError._getFormattedMessage(originalError, reporterFullName);

        super(RUNTIME_ERRORS.cannotFindReporterForAlias, reporterShortName, formattedOriginalError);
    }

    static _ensureShortName (name) {
        if (name && name.startsWith(REPORTER_MODULE_PREFIX))
            return name.replace(REPORTER_MODULE_PREFIX, '');

        return name;
    }

    static _getReporterModuleNotFoundMessage (reporterModuleName) {
        return `Cannot find module "${reporterModuleName}"`;
    }

    static _getFormattedMessage (originalError, reporterFullName) {
        const isModuleNotFoundError = originalError.code && originalError.code === MODULE_NOT_FOUND_CODE;

        if (!isModuleNotFoundError)
            return formatErrorWithCallsite(originalError);

        // NOTE: The "message" property of the ModuleNotFound error has the following pattern: <message>\nRequire stack:\n<line1>\n<line2>.
        // We need to output the full "require" stack, unless "require('testcafe-reporter-<name>')" caused the error.
        const errorText = originalError.message.split('\n')[0];

        if (errorText.includes(reporterFullName))
            return LoadReporterError._getReporterModuleNotFoundMessage(reporterFullName);

        return formatErrorWithCallsite(originalError);
    }
}

