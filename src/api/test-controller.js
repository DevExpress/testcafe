import Promise from 'pinkie';
import { identity } from 'lodash';
import { MissingAwaitError } from '../errors/test-run';
import getCallsite from '../errors/get-callsite';
import ClientFunctionFactory from '../client-functions/client-function-factory';

import {
    ClickCommand,
    RightClickCommand,
    DoubleClickCommand,
    HoverCommand,
    DragCommand,
    DragToElementCommand,
    TypeTextCommand,
    SelectTextCommand,
    SelectTextAreaContentCommand,
    SelectEditableContentCommand,
    PressKeyCommand,
    WaitCommand,
    WaitForElementCommand,
    NavigateToCommand,
    UploadFileCommand,
    ClearUploadCommand,
    TakeScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand
} from '../test-run/commands';

const API_IMPLEMENTATION_METHOD_RE = /^_(\S+)\$$/;

export default class TestController {
    constructor (testRun) {
        this.testRun              = testRun;
        this.executionChain       = Promise.resolve();
        this.apiMethods           = this._createAPIMethodsList();
        this.callsiteWithoutAwait = null;
    }

    _createAPIMethodsList () {
        return Object
            .keys(TestController.prototype)
            .map(prop => {
                var match = prop.match(API_IMPLEMENTATION_METHOD_RE);

                return match && match[1];
            })
            .filter(name => !!name);
    }


    // NOTE: we track missing `awaits` by exposing a special custom Promise to user code.
    // Action or assertion is awaited if:
    // a)someone used `await` so Promise's `then` function executed
    // b)Promise chained by using one of the mixed-in controller methods
    //
    // In both scenarios, we check that callsite that produced Promise is equal to the one
    // that is currently missing await. This is required to workaround scenarios like this:
    //
    // var t2 = t.click('#btn1'); // <-- stores new callsiteWithoutAwait
    // await t2;                  // <-- callsiteWithoutAwait = null
    // t.click('#btn2');          // <-- stores new callsiteWithoutAwait
    // await t2.click('#btn3');   // <-- without check it will set callsiteWithoutAwait = null, so we will lost tracking
    _createExtendedPromise (promise, callsite) {
        var extendedPromise = promise.then(identity);
        var originalThen    = extendedPromise.then;

        var ensureAwait = () => {
            if (this.callsiteWithoutAwait === callsite)
                this.callsiteWithoutAwait = null;
        };

        extendedPromise.then = function () {
            ensureAwait();
            return originalThen.apply(this, arguments);
        };

        this.apiMethods.forEach(name => {
            var controller = this;

            extendedPromise[name] = function () {
                ensureAwait();
                return controller[`_${name}$`].apply(controller, arguments);
            };
        });

        return extendedPromise;
    }

    _enqueueAction (apiMethodName, CmdCtor, cmdArgs) {
        this._checkForMissingAwait();

        var callsite = getCallsite(apiMethodName);
        var command  = null;

        try {
            command = new CmdCtor(cmdArgs);
        }
        catch (err) {
            err.callsite = callsite;
            throw err;
        }

        this.executionChain       = this.executionChain.then(() => this.testRun.executeCommand(command, callsite));
        this.callsiteWithoutAwait = callsite;

        return this._createExtendedPromise(this.executionChain, callsite);
    }

    _checkForMissingAwait () {
        if (this.callsiteWithoutAwait)
            throw new MissingAwaitError(this.callsiteWithoutAwait);
    }

    // API implementation
    // We need implementation methods to obtain correct callsites. If we use plain API
    // methods in chained wrappers then we will have callsite for the wrapped method
    // in this file instead of chained method callsite in user code.
    _click$ (selector, options) {
        return this._enqueueAction('click', ClickCommand, { selector, options });
    }

    _rightClick$ (selector, options) {
        return this._enqueueAction('rightClick', RightClickCommand, { selector, options });
    }

    _doubleClick$ (selector, options) {
        return this._enqueueAction('doubleClick', DoubleClickCommand, { selector, options });
    }

    _hover$ (selector, options) {
        return this._enqueueAction('hover', HoverCommand, { selector, options });
    }

    _drag$ (selector, dragOffsetX, dragOffsetY, options) {
        return this._enqueueAction('drag', DragCommand, { selector, dragOffsetX, dragOffsetY, options });
    }

    _dragToElement$ (selector, destinationSelector, options) {
        return this._enqueueAction('dragToElement', DragToElementCommand, { selector, destinationSelector, options });
    }

    _typeText$ (selector, text, options) {
        return this._enqueueAction('typeText', TypeTextCommand, { selector, text, options });
    }

    _selectText$ (selector, startPos, endPos) {
        return this._enqueueAction('selectText', SelectTextCommand, { selector, startPos, endPos });
    }

    _selectTextAreaContent$ (selector, startLine, startPos, endLine, endPos) {
        return this._enqueueAction('selectTextAreaContent', SelectTextAreaContentCommand, {
            selector,
            startLine,
            startPos,
            endLine,
            endPos
        });
    }

    _selectEditableContent$ (startSelector, endSelector) {
        return this._enqueueAction('selectEditableContent', SelectEditableContentCommand, {
            startSelector,
            endSelector
        });
    }

    _pressKey$ (keys) {
        return this._enqueueAction('pressKey', PressKeyCommand, { keys });
    }

    _wait$ (timeout) {
        return this._enqueueAction('wait', WaitCommand, { timeout });
    }

    _waitForElement$ (selector, timeout) {
        return this._enqueueAction('waitForElement', WaitForElementCommand, { selector, timeout });
    }

    _navigateTo$ (url) {
        return this._enqueueAction('navigateTo', NavigateToCommand, { url });
    }

    _uploadFile$ (selector, filePath) {
        return this._enqueueAction('uploadFile', UploadFileCommand, { selector, filePath });
    }

    _clearUpload$ (selector) {
        return this._enqueueAction('clearUpload', ClearUploadCommand, { selector });
    }

    _takeScreenshot$ (path) {
        return this._enqueueAction('takeScreenshot', TakeScreenshotCommand, { path });
    }

    _resizeWindow$ (width, height) {
        return this._enqueueAction('resizeWindow', ResizeWindowCommand, { width, height });
    }

    _resizeWindowToFitDevice$ (device, options) {
        return this._enqueueAction('resizeWindowToFitDevice', ResizeWindowToFitDeviceCommand, { device, options });
    }

    _eval$ (fn, dependencies) {
        var factory  = new ClientFunctionFactory(fn, dependencies, { instantiation: 'eval', execution: 'eval' });
        var clientFn = factory.getFunction({ boundTestRun: this.testRun });

        return clientFn();
    }
}

(function createAPIMethods () {
    Object
        .keys(TestController.prototype)
        .forEach(prop => {
            var match = prop.match(API_IMPLEMENTATION_METHOD_RE);

            if (match) {
                var apiMethodName = match[1];

                TestController.prototype[apiMethodName] = function () {
                    return TestController.prototype[prop].apply(this, arguments);
                };
            }
        });
})();

