'use strict';

exports.__esModule = true;

var _SUBTITLES, _TYPE$actionIntegerOp;

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _lodash = require('lodash');

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _phase = require('../../test-run/phase');

var _phase2 = _interopRequireDefault(_phase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SUBTITLES = (_SUBTITLES = {}, _SUBTITLES[_phase2.default.initial] = '', _SUBTITLES[_phase2.default.inFixtureBeforeHook] = '<span class="subtitle">Error in fixture.before hook</span>\n', _SUBTITLES[_phase2.default.inFixtureBeforeEachHook] = '<span class="subtitle">Error in fixture.beforeEach hook</span>\n', _SUBTITLES[_phase2.default.inTestBeforeHook] = '<span class="subtitle">Error in test.before hook</span>\n', _SUBTITLES[_phase2.default.inTest] = '', _SUBTITLES[_phase2.default.inTestAfterHook] = '<span class="subtitle">Error in test.after hook</span>\n', _SUBTITLES[_phase2.default.inFixtureAfterEachHook] = '<span class="subtitle">Error in fixture.afterEach hook</span>\n', _SUBTITLES[_phase2.default.inFixtureAfterHook] = '<span class="subtitle">Error in fixture.after hook</span>\n', _SUBTITLES[_phase2.default.inRoleInitializer] = '<span class="subtitle">Error in Role initializer</span>\n', _SUBTITLES[_phase2.default.inBookmarkRestore] = '<span class="subtitle">Error while restoring configuration after Role switch</span>\n', _SUBTITLES);

function markup(err, msgMarkup) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    msgMarkup = (0, _dedent2.default)('\n        ' + SUBTITLES[err.testRunPhase] + '<div class="message">' + (0, _dedent2.default)(msgMarkup) + '</div>\n\n        <strong>Browser:</strong> <span class="user-agent">' + err.userAgent + '</span>\n    ');

    if (err.screenshotPath) msgMarkup += '\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">' + (0, _lodash.escape)(err.screenshotPath) + '</a></div>';

    if (!opts.withoutCallsite) {
        var callsiteMarkup = err.getCallsiteMarkup();

        if (callsiteMarkup) msgMarkup += '\n\n' + callsiteMarkup;
    }

    return msgMarkup;
}

exports.default = (_TYPE$actionIntegerOp = {}, _TYPE$actionIntegerOp[_type2.default.actionIntegerOptionError] = function (err) {
    return markup(err, '\n        The "' + err.optionName + '" option is expected to be an integer, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionPositiveIntegerOptionError] = function (err) {
    return markup(err, '\n        The "' + err.optionName + '" option is expected to be a positive integer, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionBooleanOptionError] = function (err) {
    return markup(err, '\n        The "' + err.optionName + '" option is expected to be a boolean value, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionSpeedOptionError] = function (err) {
    return markup(err, '\n        The "' + err.optionName + '" option is expected to be a number between 0.01 and 1, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.pageLoadError] = function (err) {
    return markup(err, '\n        ' + err.errMsg + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtErrorOnPage] = function (err) {
    return markup(err, '\n        Error on page <a href="' + err.pageDestUrl + '">' + err.pageDestUrl + '</a>:\n\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtErrorInTestCode] = function (err) {
    return markup(err, '\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.nativeDialogNotHandledError] = function (err) {
    return markup(err, '\n        A native ' + err.dialogType + ' dialog was invoked on page <a href="' + err.pageUrl + '">' + err.pageUrl + '</a>, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtErrorInNativeDialogHandler] = function (err) {
    return markup(err, '\n        An error occurred in the native dialog handler called for a native ' + err.dialogType + ' dialog on page <a href="' + err.pageUrl + '">' + err.pageUrl + '</a>:\n\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.setTestSpeedArgumentError] = function (err) {
    return markup(err, '\n        Speed is expected to be a number between 0.01 and 1, but ' + err.actualValue + ' was passed.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.setNativeDialogHandlerCodeWrongTypeError] = function (err) {
    return markup(err, '\n        The native dialog handler is expected to be a function, ClientFunction or null, but it was ' + err.actualType + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtErrorInClientFunctionCode] = function (err) {
    return markup(err, '\n        An error occurred in ' + err.instantiationCallsiteName + ' code:\n\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtErrorInCustomDOMPropertyCode] = function (err) {
    return markup(err, '\n        An error occurred when trying to calculate a custom Selector property "' + err.property + '":\n\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.clientFunctionExecutionInterruptionError] = function (err) {
    return markup(err, '\n        ' + err.instantiationCallsiteName + ' execution was interrupted by page unload. This problem may appear if you trigger page navigation from ' + err.instantiationCallsiteName + ' code.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.uncaughtNonErrorObjectInTestCode] = function (err) {
    return markup(err, '\n        Uncaught ' + err.objType + ' "' + (0, _lodash.escape)(err.objStr) + '" was thrown. Throw Error instead.\n    ', { withoutCallsite: true });
}, _TYPE$actionIntegerOp[_type2.default.actionOptionsTypeError] = function (err) {
    return markup(err, '\n        Action options is expected to be an object, null or undefined but it was ' + err.actualType + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionStringArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be a non-empty string, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionNullableStringArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be a null or a string, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionStringOrStringArrayArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be a non-empty string or a string array, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionStringArrayElementError] = function (err) {
    return markup(err, '\n        Elements of the "' + err.argumentName + '" argument are expected to be non-empty strings, but the element at index ' + err.elementIndex + ' was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionIntegerArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be an integer, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionRoleArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be a Role instance, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionPositiveIntegerArgumentError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument is expected to be a positive integer, but it was ' + err.actualValue + '.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementNotFoundError] = function (err) {
    return markup(err, '\n        The specified selector does not match any element in the DOM tree.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementIsInvisibleError] = function (err) {
    return markup(err, '\n        The element that matches the specified selector is not visible.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionSelectorMatchesWrongNodeTypeError] = function (err) {
    return markup(err, '\n        The specified selector is expected to match a DOM element, but it matches a ' + err.nodeDescription + ' node.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionAdditionalElementNotFoundError] = function (err) {
    return markup(err, '\n        The specified "' + err.argumentName + '" does not match any element in the DOM tree.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionAdditionalElementIsInvisibleError] = function (err) {
    return markup(err, '\n        The element that matches the specified "' + err.argumentName + '" is not visible.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionAdditionalSelectorMatchesWrongNodeTypeError] = function (err) {
    return markup(err, '\n        The specified "' + err.argumentName + '" is expected to match a DOM element, but it matches a ' + err.nodeDescription + ' node.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementNonEditableError] = function (err) {
    return markup(err, '\n        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementNonContentEditableError] = function (err) {
    return markup(err, '\n        The element that matches the specified "' + err.argumentName + '" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionRootContainerNotFoundError] = function (err) {
    return markup(err, '\n        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementIsNotFileInputError] = function (err) {
    return markup(err, '\n        The specified selector does not match a file input element.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionCanNotFindFileToUploadError] = function (err) {
    return markup(err, '\n        Cannot find the following file(s) to upload:\n        ' + err.filePaths.map(function (path) {
        return '  ' + (0, _lodash.escape)(path);
    }).join('\n') + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementNotTextAreaError] = function (err) {
    return markup(err, '\n        The action element is expected to be a &lt;textarea&gt;.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionElementNotIframeError] = function (err) {
    return markup(err, '\n        The action element is expected to be an &lt;iframe&gt.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionIncorrectKeysError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument contains an incorrect key or key combination.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionUnsupportedDeviceTypeError] = function (err) {
    return markup(err, '\n        The "' + err.argumentName + '" argument specifies an unsupported "' + err.actualValue + '" device. For a list of supported devices, refer to <a href="http://viewportsizes.com">http://viewportsizes.com</a>.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionInvalidScrollTargetError] = function (err) {
    return markup(err, '\n        Unable to scroll to the specified point because a point with the specified ' + err.properties + ' is not located inside the element\'s cropping region.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionIframeIsNotLoadedError] = function (err) {
    return markup(err, '\n        Content of the iframe to which you are switching did not load.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.currentIframeIsNotLoadedError] = function (err) {
    return markup(err, '\n        Content of the iframe in which the test is currently operating did not load.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.currentIframeNotFoundError] = function (err) {
    return markup(err, '\n        The iframe in which the test is currently operating does not exist anymore.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.currentIframeIsInvisibleError] = function (err) {
    return markup(err, '\n        The iframe in which the test is currently operating is not visible anymore.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.missingAwaitError] = function (err) {
    return markup(err, '\n        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.externalAssertionLibraryError] = function (err) {
    return markup(err, '\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.domNodeClientFunctionResultError] = function (err) {
    return markup(err, '\n       ' + err.instantiationCallsiteName + ' cannot return DOM elements. Use Selector functions for this purpose.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.invalidSelectorResultError] = function (err) {
    return markup(err, '\n        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.actionSelectorError] = function (err) {
    return markup(err, '\n        Action "' + err.selectorName + '" argument error:\n\n        ' + (0, _lodash.escape)(err.errMsg) + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.cantObtainInfoForElementSpecifiedBySelectorError] = function (err) {
    return markup(err, '\n        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.windowDimensionsOverflowError] = function (err) {
    return markup(err, '\n        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.invalidElementScreenshotDimensionsError] = function (err) {
    return markup(err, '\n         Unable to capture an element image because the resulting image ' + err.dimensions + ' ' + err.verb + ' zero or negative.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.roleSwitchInRoleInitializerError] = function (err) {
    return markup(err, '\n        Role cannot be switched while another role is being initialized.\n    ');
}, _TYPE$actionIntegerOp[_type2.default.assertionExecutableArgumentError] = function (err) {
    return markup(err, '\n        Cannot evaluate the "' + err.actualValue + '" expression in the "' + err.argumentName + '" parameter because of the following error:\n\n        ' + err.errMsg + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.requestHookConfigureAPIError] = function (err) {
    return markup(err, '\n        There was an error while configuring the request hook:\n        \n        ' + err.requestHookName + ': ' + err.errMsg + '\n    ');
}, _TYPE$actionIntegerOp[_type2.default.assertionUnawaitedPromiseError] = function (err) {
    return markup(err, '\n        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.\n    ');
}, _TYPE$actionIntegerOp);
module.exports = exports['default'];