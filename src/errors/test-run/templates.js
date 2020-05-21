import { escape as escapeHtml } from 'lodash';
import { TEST_RUN_ERRORS } from '../types';
import {
    renderForbiddenCharsList,
    formatSelectorCallstack,
    formatUrl,
    replaceLeadingSpacesWithNbsp,
    formatExpressionMessage
} from './utils';

const EXTERNAL_LINKS = {
    createNewIssue:      'https://github.com/DevExpress/testcafe/issues/new?template=bug-report.md',
    troubleshootNetwork: 'https://go.devexpress.com/TestCafe_FAQ_ARequestHasFailed.aspx',
    viewportSizes:       'https://github.com/DevExpress/device-specs/blob/master/viewport-sizes.json'
};

export default {
    [TEST_RUN_ERRORS.actionIntegerOptionError]: err => `
        The "${err.optionName}" option is expected to be an integer, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionPositiveIntegerOptionError]: err => `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionBooleanOptionError]: err => `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionSpeedOptionError]: err => `
        The "${err.optionName}" option is expected to be a number between 0.01 and 1, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.pageLoadError]: err => `
        A request to ${formatUrl(err.url)} has failed.
        Use quarantine mode to perform additional attempts to execute this test.
        You can find troubleshooting information for this issue at ${formatUrl(EXTERNAL_LINKS.troubleshootNetwork)}.

        Error details:
        ${err.errMsg}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorOnPage]: err => `
        A JavaScript error occurred on ${formatUrl(err.pageDestUrl)}.
        Repeat test actions in the browser and check the console for errors.
        If you see this error, it means that the tested website caused it. You can fix it or disable tracking JavaScript errors in TestCafe. To do the latter, enable the "--skip-js-errors" option.
        If this error does not occur, please write a new issue at:
        ${formatUrl(EXTERNAL_LINKS.createNewIssue)}.

        JavaScript error details:
        ${replaceLeadingSpacesWithNbsp(escapeHtml(err.errStack))}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInTestCode]: err => `
        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.nativeDialogNotHandledError]: err => `
        A native ${err.dialogType} dialog was invoked on page ${formatUrl(err.pageUrl)}, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler]: err => `
        An error occurred in the native dialog handler called for a native ${err.dialogType} dialog on page ${formatUrl(err.pageUrl)}:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.setTestSpeedArgumentError]: err => `
        Speed is expected to be a number between 0.01 and 1, but ${err.actualValue} was passed.
    `,

    [TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError]: err => `
        The native dialog handler is expected to be a function, ClientFunction or null, but it was ${err.actualType}.
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode]: err => `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode]: err => `
        An error occurred when trying to calculate a custom Selector property "${err.property}":

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError]: err => `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.
    `,

    [TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode]: err => `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw Error instead.
    `,

    [TEST_RUN_ERRORS.unhandledPromiseRejection]: err => `
        Unhandled promise rejection:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.uncaughtException]: err => `
        Uncaught exception:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.actionOptionsTypeError]: err => `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.
    `,

    [TEST_RUN_ERRORS.actionStringArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionBooleanArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a boolean value, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionNullableStringArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a null or a string, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionStringArrayElementError]: err => `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionIntegerArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionRoleArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a Role instance, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionPositiveIntegerArgumentError]: err => `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.
    `,

    [TEST_RUN_ERRORS.actionElementNotFoundError]: (err, viewportWidth) => `
        The specified selector does not match any element in the DOM tree.

        ${formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `,

    [TEST_RUN_ERRORS.actionElementIsInvisibleError]: () => `
        The element that matches the specified selector is not visible.
    `,

    [TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError]: err => `
        The specified selector is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `,

    [TEST_RUN_ERRORS.actionAdditionalElementNotFoundError]: (err, viewportWidth) => `
        The specified "${err.argumentName}" does not match any element in the DOM tree.

        ${formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `,

    [TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError]: err => `
        The element that matches the specified "${err.argumentName}" is not visible.
    `,

    [TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError]: err => `
        The specified "${err.argumentName}" is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `,

    [TEST_RUN_ERRORS.actionElementNonEditableError]: () => `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).
    `,

    [TEST_RUN_ERRORS.actionElementNonContentEditableError]: err => `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.
    `,

    [TEST_RUN_ERRORS.actionRootContainerNotFoundError]: () => `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.
    `,

    [TEST_RUN_ERRORS.actionElementIsNotFileInputError]: () => `
        The specified selector does not match a file input element.
    `,

    [TEST_RUN_ERRORS.actionCannotFindFileToUploadError]: err => `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => escapeHtml(path)).join('\n')}

        The following locations were scanned for the missing upload files:
        ${err.scannedFilePaths.map(path => escapeHtml(path)).join('\n')}

        Ensure these files exist or change the working directory.
    `,

    [TEST_RUN_ERRORS.actionElementNotTextAreaError]: () => `
        The action element is expected to be a &lt;textarea&gt;.
    `,

    [TEST_RUN_ERRORS.actionElementNotIframeError]: () => `
        The action element is expected to be an &lt;iframe&gt.
    `,

    [TEST_RUN_ERRORS.actionIncorrectKeysError]: err => `
        The "${err.argumentName}" argument contains an incorrect key or key combination.
    `,

    [TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError]: err => `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to ${formatUrl(EXTERNAL_LINKS.viewportSizes)}.
    `,

    [TEST_RUN_ERRORS.actionInvalidScrollTargetError]: err => `
        Unable to scroll to the specified point because a point with the specified ${err.properties} is not located inside the element's cropping region.
    `,

    [TEST_RUN_ERRORS.actionIframeIsNotLoadedError]: () => `
        Content of the iframe to which you are switching did not load.
    `,

    [TEST_RUN_ERRORS.currentIframeIsNotLoadedError]: () => `
        Content of the iframe in which the test is currently operating did not load.
    `,

    [TEST_RUN_ERRORS.currentIframeNotFoundError]: () => `
        The iframe in which the test is currently operating does not exist anymore.
    `,

    [TEST_RUN_ERRORS.currentIframeIsInvisibleError]: () => `
        The iframe in which the test is currently operating is not visible anymore.
    `,

    [TEST_RUN_ERRORS.missingAwaitError]: () => `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.
    `,

    [TEST_RUN_ERRORS.externalAssertionLibraryError]: err => `
        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.domNodeClientFunctionResultError]: err => `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.
    `,

    [TEST_RUN_ERRORS.invalidSelectorResultError]: () => `
        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.
    `,

    [TEST_RUN_ERRORS.actionSelectorError]: err => `
        Action "${err.selectorName}" argument error:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError]: (err, viewportWidth) => `
        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.

        ${formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `,

    [TEST_RUN_ERRORS.windowDimensionsOverflowError]: () => `
        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.
    `,

    [TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError]: err => `
        There are forbidden characters in the "${err.screenshotPath}" screenshot path:
        ${renderForbiddenCharsList(err.forbiddenCharsList)}
    `,

    [TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError]: err => `
         Unable to capture an element image because the resulting image ${err.dimensions} ${err.verb} zero or negative.
    `,

    [TEST_RUN_ERRORS.roleSwitchInRoleInitializerError]: () => `
        Role cannot be switched while another role is being initialized.
    `,

    [TEST_RUN_ERRORS.assertionExecutableArgumentError]: err => `
        Cannot evaluate the "${err.actualValue}" expression in the "${err.argumentName}" parameter because of the following error:

        ${err.errMsg}
    `,

    [TEST_RUN_ERRORS.assertionWithoutMethodCallError]: () => `
        An assertion method is not specified.
    `,

    [TEST_RUN_ERRORS.assertionUnawaitedPromiseError]: () => `
        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.
    `,

    [TEST_RUN_ERRORS.requestHookNotImplementedError]: err => `
        You should implement the "${err.methodName}" method in the "${err.hookClassName}" class.
    `,

    [TEST_RUN_ERRORS.requestHookUnhandledError]: err => `
        An unhandled error occurred in the "${err.methodName}" method of the "${err.hookClassName}" class:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCode]: err => `
        An error occurred in a script injected into the tested page:

        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCodeLoadedFromModule]: err => `
        An error occurred in the '${err.moduleName}' module injected into the tested page. Make sure that this module can be executed in the browser environment.

        Error details:
        ${escapeHtml(err.errMsg)}
    `,

    [TEST_RUN_ERRORS.uncaughtErrorInCustomScript]: err => `
        An unhandled error occurred in the custom script:

        Error details: ${escapeHtml(err.errMsg)}

        ${formatExpressionMessage(err.expression, err.line, err.column)}
    `,

    [TEST_RUN_ERRORS.childWindowIsNotLoadedError]: () => `
        The page in the child window is not loaded.
    `,

    [TEST_RUN_ERRORS.childWindowNotFoundError]: () => `
        The child window is not found.
    `,

    [TEST_RUN_ERRORS.cannotSwitchToWindowError]: () => `
        Cannot switch to the window.
    `,

    [TEST_RUN_ERRORS.closeChildWindowError]: () => `
        An error occurred while closing child windows.
    `,

    [TEST_RUN_ERRORS.childWindowClosedBeforeSwitchingError]: () => `
        The child window was closed before TestCafe could switch to it.
    `
};
