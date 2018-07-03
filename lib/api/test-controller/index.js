'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _getCallsite = require('../../errors/get-callsite');

var _clientFunctionBuilder = require('../../client-functions/client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _assertion = require('./assertion');

var _assertion2 = _interopRequireDefault(_assertion);

var _delegatedApi = require('../../utils/delegated-api');

var _actions = require('../../test-run/commands/actions');

var _browserManipulation = require('../../test-run/commands/browser-manipulation');

var _observation = require('../../test-run/commands/observation');

var _assertType = require('../request-hooks/assert-type');

var _assertType2 = _interopRequireDefault(_assertType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TestController = function () {
    function TestController(testRun) {
        (0, _classCallCheck3.default)(this, TestController);

        this.testRun = testRun;
        this.executionChain = _pinkie2.default.resolve();
        this.callsitesWithoutAwait = new _set2.default();
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


    TestController.prototype._createExtendedPromise = function _createExtendedPromise(promise, callsite) {
        var _this = this;

        var extendedPromise = promise.then(_lodash.identity);
        var originalThen = extendedPromise.then;
        var markCallsiteAwaited = function markCallsiteAwaited() {
            return _this.callsitesWithoutAwait.delete(callsite);
        };

        extendedPromise.then = function () {
            markCallsiteAwaited();
            return originalThen.apply(this, arguments);
        };

        (0, _delegatedApi.delegateAPI)(extendedPromise, TestController.API_LIST, {
            handler: this,
            proxyMethod: markCallsiteAwaited
        });

        return extendedPromise;
    };

    TestController.prototype._enqueueTask = function _enqueueTask(apiMethodName, createTaskExecutor) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)(apiMethodName);
        var executor = createTaskExecutor(callsite);

        this.executionChain = this.executionChain.then(executor);

        this.callsitesWithoutAwait.add(callsite);

        return this._createExtendedPromise(this.executionChain, callsite);
    };

    TestController.prototype._enqueueCommand = function _enqueueCommand(apiMethodName, CmdCtor, cmdArgs) {
        var _this2 = this;

        return this._enqueueTask(apiMethodName, function (callsite) {
            var command = null;

            try {
                command = new CmdCtor(cmdArgs);
            } catch (err) {
                err.callsite = callsite;
                throw err;
            }

            return function () {
                return _this2.testRun.executeCommand(command, callsite);
            };
        });
    };

    // API implementation
    // We need implementation methods to obtain correct callsites. If we use plain API
    // methods in chained wrappers then we will have callsite for the wrapped method
    // in this file instead of chained method callsite in user code.


    TestController.prototype._ctx$getter = function _ctx$getter() {
        return this.testRun.ctx;
    };

    TestController.prototype._ctx$setter = function _ctx$setter(val) {
        this.testRun.ctx = val;

        return this.testRun.ctx;
    };

    TestController.prototype._fixtureCtx$getter = function _fixtureCtx$getter() {
        return this.testRun.fixtureCtx;
    };

    TestController.prototype._click$ = function _click$(selector, options) {
        return this._enqueueCommand('click', _actions.ClickCommand, { selector: selector, options: options });
    };

    TestController.prototype._rightClick$ = function _rightClick$(selector, options) {
        return this._enqueueCommand('rightClick', _actions.RightClickCommand, { selector: selector, options: options });
    };

    TestController.prototype._doubleClick$ = function _doubleClick$(selector, options) {
        return this._enqueueCommand('doubleClick', _actions.DoubleClickCommand, { selector: selector, options: options });
    };

    TestController.prototype._hover$ = function _hover$(selector, options) {
        return this._enqueueCommand('hover', _actions.HoverCommand, { selector: selector, options: options });
    };

    TestController.prototype._drag$ = function _drag$(selector, dragOffsetX, dragOffsetY, options) {
        return this._enqueueCommand('drag', _actions.DragCommand, { selector: selector, dragOffsetX: dragOffsetX, dragOffsetY: dragOffsetY, options: options });
    };

    TestController.prototype._dragToElement$ = function _dragToElement$(selector, destinationSelector, options) {
        return this._enqueueCommand('dragToElement', _actions.DragToElementCommand, { selector: selector, destinationSelector: destinationSelector, options: options });
    };

    TestController.prototype._typeText$ = function _typeText$(selector, text, options) {
        return this._enqueueCommand('typeText', _actions.TypeTextCommand, { selector: selector, text: text, options: options });
    };

    TestController.prototype._selectText$ = function _selectText$(selector, startPos, endPos, options) {
        return this._enqueueCommand('selectText', _actions.SelectTextCommand, { selector: selector, startPos: startPos, endPos: endPos, options: options });
    };

    TestController.prototype._selectTextAreaContent$ = function _selectTextAreaContent$(selector, startLine, startPos, endLine, endPos, options) {
        return this._enqueueCommand('selectTextAreaContent', _actions.SelectTextAreaContentCommand, {
            selector: selector,
            startLine: startLine,
            startPos: startPos,
            endLine: endLine,
            endPos: endPos,
            options: options
        });
    };

    TestController.prototype._selectEditableContent$ = function _selectEditableContent$(startSelector, endSelector, options) {
        return this._enqueueCommand('selectEditableContent', _actions.SelectEditableContentCommand, {
            startSelector: startSelector,
            endSelector: endSelector,
            options: options
        });
    };

    TestController.prototype._pressKey$ = function _pressKey$(keys, options) {
        return this._enqueueCommand('pressKey', _actions.PressKeyCommand, { keys: keys, options: options });
    };

    TestController.prototype._wait$ = function _wait$(timeout) {
        return this._enqueueCommand('wait', _observation.WaitCommand, { timeout: timeout });
    };

    TestController.prototype._navigateTo$ = function _navigateTo$(url) {
        return this._enqueueCommand('navigateTo', _actions.NavigateToCommand, { url: url });
    };

    TestController.prototype._setFilesToUpload$ = function _setFilesToUpload$(selector, filePath) {
        return this._enqueueCommand('setFilesToUpload', _actions.SetFilesToUploadCommand, { selector: selector, filePath: filePath });
    };

    TestController.prototype._clearUpload$ = function _clearUpload$(selector) {
        return this._enqueueCommand('clearUpload', _actions.ClearUploadCommand, { selector: selector });
    };

    TestController.prototype._takeScreenshot$ = function _takeScreenshot$(path) {
        return this._enqueueCommand('takeScreenshot', _browserManipulation.TakeScreenshotCommand, { path: path });
    };

    TestController.prototype._takeElementScreenshot$ = function _takeElementScreenshot$(selector) {
        var commandArgs = { selector: selector };

        if (arguments.length <= 2 ? undefined : arguments[2]) {
            commandArgs.path = arguments.length <= 1 ? undefined : arguments[1];
            commandArgs.options = arguments.length <= 2 ? undefined : arguments[2];
        } else if ((0, _typeof3.default)(arguments.length <= 1 ? undefined : arguments[1]) === 'object') commandArgs.options = arguments.length <= 1 ? undefined : arguments[1];else commandArgs.path = arguments.length <= 1 ? undefined : arguments[1];

        return this._enqueueCommand('takeElementScreenshot', _browserManipulation.TakeElementScreenshotCommand, commandArgs);
    };

    TestController.prototype._resizeWindow$ = function _resizeWindow$(width, height) {
        return this._enqueueCommand('resizeWindow', _browserManipulation.ResizeWindowCommand, { width: width, height: height });
    };

    TestController.prototype._resizeWindowToFitDevice$ = function _resizeWindowToFitDevice$(device, options) {
        return this._enqueueCommand('resizeWindowToFitDevice', _browserManipulation.ResizeWindowToFitDeviceCommand, { device: device, options: options });
    };

    TestController.prototype._maximizeWindow$ = function _maximizeWindow$() {
        return this._enqueueCommand('maximizeWindow', _browserManipulation.MaximizeWindowCommand);
    };

    TestController.prototype._switchToIframe$ = function _switchToIframe$(selector) {
        return this._enqueueCommand('switchToIframe', _actions.SwitchToIframeCommand, { selector: selector });
    };

    TestController.prototype._switchToMainWindow$ = function _switchToMainWindow$() {
        return this._enqueueCommand('switchToMainWindow', _actions.SwitchToMainWindowCommand);
    };

    TestController.prototype._eval$ = function _eval$(fn, options) {
        if (!(0, _lodash.isNil)(options)) options = (0, _lodash.assign)({}, options, { boundTestRun: this });

        var builder = new _clientFunctionBuilder2.default(fn, options, { instantiation: 'eval', execution: 'eval' });
        var clientFn = builder.getFunction();

        return clientFn();
    };

    TestController.prototype._setNativeDialogHandler$ = function _setNativeDialogHandler$(fn, options) {
        return this._enqueueCommand('setNativeDialogHandler', _actions.SetNativeDialogHandlerCommand, {
            dialogHandler: { fn: fn, options: options }
        });
    };

    TestController.prototype._getNativeDialogHistory$ = function _getNativeDialogHistory$() {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('getNativeDialogHistory');

        return this.testRun.executeCommand(new _actions.GetNativeDialogHistoryCommand(), callsite);
    };

    TestController.prototype._getBrowserConsoleMessages$ = function _getBrowserConsoleMessages$() {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('getBrowserConsoleMessages');

        return this.testRun.executeCommand(new _actions.GetBrowserConsoleMessagesCommand(), callsite);
    };

    TestController.prototype._expect$ = function _expect$(actual) {
        return new _assertion2.default(actual, this);
    };

    TestController.prototype._debug$ = function _debug$() {
        return this._enqueueCommand('debug', _observation.DebugCommand);
    };

    TestController.prototype._setTestSpeed$ = function _setTestSpeed$(speed) {
        return this._enqueueCommand('setTestSpeed', _actions.SetTestSpeedCommand, { speed: speed });
    };

    TestController.prototype._setPageLoadTimeout$ = function _setPageLoadTimeout$(duration) {
        return this._enqueueCommand('setPageLoadTimeout', _actions.SetPageLoadTimeoutCommand, { duration: duration });
    };

    TestController.prototype._useRole$ = function _useRole$(role) {
        return this._enqueueCommand('useRole', _actions.UseRoleCommand, { role: role });
    };

    TestController.prototype._addRequestHooks$ = function _addRequestHooks$() {
        var _this3 = this;

        for (var _len = arguments.length, hooks = Array(_len), _key = 0; _key < _len; _key++) {
            hooks[_key] = arguments[_key];
        }

        return this._enqueueTask('addRequestHooks', function () {
            hooks = (0, _lodash.flattenDeep)(hooks);

            (0, _assertType2.default)(hooks);

            hooks.forEach(function (hook) {
                return _this3.testRun.addRequestHook(hook);
            });
        });
    };

    TestController.prototype._removeRequestHooks$ = function _removeRequestHooks$() {
        var _this4 = this;

        for (var _len2 = arguments.length, hooks = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            hooks[_key2] = arguments[_key2];
        }

        return this._enqueueTask('removeRequestHooks', function () {
            hooks = (0, _lodash.flattenDeep)(hooks);

            (0, _assertType2.default)(hooks);

            hooks.forEach(function (hook) {
                return _this4.testRun.removeRequestHook(hook);
            });
        });
    };

    return TestController;
}();

exports.default = TestController;


TestController.API_LIST = (0, _delegatedApi.getDelegatedAPIList)(TestController.prototype);

(0, _delegatedApi.delegateAPI)(TestController.prototype, TestController.API_LIST, { useCurrentCtxAsHandler: true });
module.exports = exports['default'];