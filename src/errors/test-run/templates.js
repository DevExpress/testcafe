import { escape as escapeHtml } from 'lodash';
import { TEST_RUN_ERRORS } from '../types';
import {
    renderForbiddenCharsList,
    markup,
    formatSelectorCallstack,
    formatUrl,
    replaceLeadingSpacesWithNbsp
} from './utils';

const EXTERNAL_LINKS = {
    createNewIssue:      'https://github.com/DevExpress/testcafe/issues/new?template=bug-report.md',
    troubleshootNetwork: 'https://go.devexpress.com/TestCafe_FAQ_ARequestHasFailed.aspx',
    viewportSizes:       'http://viewportsizes.com'
};

export default {
    [TEST_RUN_ERRORS.actionIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionPositiveIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionBooleanOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionSpeedOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a number between 0.01 and 1, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.pageLoadError]: err => markup(err, `
        A request to ${formatUrl(err.url)} has failed. 
        Use quarantine mode to perform additional attempts to execute this test. 
        You can find troubleshooting information for this issue at ${formatUrl(EXTERNAL_LINKS.troubleshootNetwork)}.

        Error details:
        ${err.errMsg}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorOnPage]: err => markup(err, `
        A JavaScript error occurred on ${formatUrl(err.pageDestUrl)}.
        Repeat test actions in the browser and check the console for errors.
        If you see this error, it means that the tested website caused it. You can fix it or disable tracking JavaScript errors in TestCafe. To do the latter, enable the "--skip-js-errors" option.
        If this error does not occur, please write a new issue at:
        ${formatUrl(EXTERNAL_LINKS.createNewIssue)}.

        JavaScript error details:
        ${replaceLeadingSpacesWithNbsp(escapeHtml(err.errStack))}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInTestCode]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.nativeDialogNotHandledError]: err => markup(err, `
        A native ${err.dialogType} dialog was invoked on page ${formatUrl(err.pageUrl)}, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler]: err => markup(err, `
        An error occurred in the native dialog handler called for a native ${err.dialogType} dialog on page ${formatUrl(err.pageUrl)}:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.setTestSpeedArgumentError]: err => markup(err, `
        Speed is expected to be a number between 0.01 and 1, but ${err.actualValue} was passed.
    `),

    [TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError]: err => markup(err, `
        The native dialog handler is expected to be a function, ClientFunction or null, but it was ${err.actualType}.
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode]: err => markup(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode]: err => markup(err, `
        An error occurred when trying to calculate a custom Selector property "${err.property}":

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError]: err => markup(err, `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.
    `),

    [TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode]: err => markup(err, `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw Error instead.
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.unhandledPromiseRejection]: err => markup(err, `
        Unhandled promise rejection:

        ${escapeHtml(err.errMsg)}
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.uncaughtException]: err => markup(err, `
        Uncaught exception:

        ${escapeHtml(err.errMsg)}
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.actionOptionsTypeError]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.
    `),

    [TEST_RUN_ERRORS.actionStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionBooleanArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionNullableStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a null or a string, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionStringArrayElementError]: err => markup(err, `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionRoleArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a Role instance, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionPositiveIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionElementNotFoundError]: (err, viewportWidth) => markup(err, `
        The specified selector does not match any element in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.actionElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified selector is not visible.
    `),

    [TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError]: err => markup(err, `
        The specified selector is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TEST_RUN_ERRORS.actionAdditionalElementNotFoundError]: (err, viewportWidth) => markup(err, `
        The specified "${err.argumentName}" does not match any element in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is not visible.
    `),

    [TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError]: err => markup(err, `
        The specified "${err.argumentName}" is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TEST_RUN_ERRORS.actionElementNonEditableError]: err => markup(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).
    `),

    [TEST_RUN_ERRORS.actionElementNonContentEditableError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.
    `),

    [TEST_RUN_ERRORS.actionRootContainerNotFoundError]: err => markup(err, `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.
    `),

    [TEST_RUN_ERRORS.actionElementIsNotFileInputError]: err => markup(err, `
        The specified selector does not match a file input element.
    `),

    [TEST_RUN_ERRORS.actionCannotFindFileToUploadError]: err => markup(err, `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => `  ${escapeHtml(path)}`).join('\n')}
    `),

    [TEST_RUN_ERRORS.actionElementNotTextAreaError]: err => markup(err, `
        The action element is expected to be a &lt;textarea&gt;.
    `),

    [TEST_RUN_ERRORS.actionElementNotIframeError]: err => markup(err, `
        The action element is expected to be an &lt;iframe&gt.
    `),

    [TEST_RUN_ERRORS.actionIncorrectKeysError]: err => markup(err, `
        The "${err.argumentName}" argument contains an incorrect key or key combination.
    `),

    [TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError]: err => markup(err, `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to ${formatUrl(EXTERNAL_LINKS.viewportSizes)}.
    `),

    [TEST_RUN_ERRORS.actionInvalidScrollTargetError]: err => markup(err, `
        Unable to scroll to the specified point because a point with the specified ${err.properties} is not located inside the element's cropping region.
    `),

    [TEST_RUN_ERRORS.actionIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe to which you are switching did not load.
    `),

    [TEST_RUN_ERRORS.currentIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe in which the test is currently operating did not load.
    `),

    [TEST_RUN_ERRORS.currentIframeNotFoundError]: err => markup(err, `
        The iframe in which the test is currently operating does not exist anymore.
    `),

    [TEST_RUN_ERRORS.currentIframeIsInvisibleError]: err => markup(err, `
        The iframe in which the test is currently operating is not visible anymore.
    `),

    [TEST_RUN_ERRORS.missingAwaitError]: err => markup(err, `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.
    `),

    [TEST_RUN_ERRORS.externalAssertionLibraryError]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.domNodeClientFunctionResultError]: err => markup(err, `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.
    `),

    [TEST_RUN_ERRORS.invalidSelectorResultError]: err => markup(err, `
        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.
    `),

    [TEST_RUN_ERRORS.actionSelectorError]: err => markup(err, `
        Action "${err.selectorName}" argument error:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError]: (err, viewportWidth) => markup(err, `
        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.windowDimensionsOverflowError]: err => markup(err, `
        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.
    `),

    [TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError]: err => markup(err, `
        There are forbidden characters in the "${err.screenshotPath}" screenshot path:
        ${renderForbiddenCharsList(err.forbiddenCharsList)}
    `),

    [TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError]: err => markup(err, `
         Unable to capture an element image because the resulting image ${err.dimensions} ${err.verb} zero or negative.
    `),

    [TEST_RUN_ERRORS.roleSwitchInRoleInitializerError]: err => markup(err, `
        Role cannot be switched while another role is being initialized.
    `),

    [TEST_RUN_ERRORS.assertionExecutableArgumentError]: err => markup(err, `
        Cannot evaluate the "${err.actualValue}" expression in the "${err.argumentName}" parameter because of the following error:

        ${err.errMsg}
    `),

    [TEST_RUN_ERRORS.assertionWithoutMethodCallError]: err => markup(err, `
        An assertion method is not specified.
    `),

    [TEST_RUN_ERRORS.assertionUnawaitedPromiseError]: err => markup(err, `
        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.
    `),

    [TEST_RUN_ERRORS.requestHookNotImplementedError]: err => markup(err, `
        You should implement the "${err.methodName}" method in the "${err.hookClassName}" class.
    `),

    [TEST_RUN_ERRORS.requestHookUnhandledError]: err => markup(err, `
        An unhandled error occurred in the "${err.methodName}" method of the "${err.hookClassName}" class:
        
        ${escapeHtml(err.errMsg)}
    `)
};
