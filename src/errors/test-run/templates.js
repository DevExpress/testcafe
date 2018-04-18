import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';
import TEST_RUN_PHASE from '../../test-run/phase';

const SUBTITLES = {
    [TEST_RUN_PHASE.initial]:                 '',
    [TEST_RUN_PHASE.inFixtureBeforeHook]:     '<span class="subtitle">Error in fixture.before hook</span>\n',
    [TEST_RUN_PHASE.inFixtureBeforeEachHook]: '<span class="subtitle">Error in fixture.beforeEach hook</span>\n',
    [TEST_RUN_PHASE.inTestBeforeHook]:        '<span class="subtitle">Error in test.before hook</span>\n',
    [TEST_RUN_PHASE.inTest]:                  '',
    [TEST_RUN_PHASE.inTestAfterHook]:         '<span class="subtitle">Error in test.after hook</span>\n',
    [TEST_RUN_PHASE.inFixtureAfterEachHook]:  '<span class="subtitle">Error in fixture.afterEach hook</span>\n',
    [TEST_RUN_PHASE.inFixtureAfterHook]:      '<span class="subtitle">Error in fixture.after hook</span>\n',
    [TEST_RUN_PHASE.inRoleInitializer]:       '<span class="subtitle">Error in Role initializer</span>\n',
    [TEST_RUN_PHASE.inBookmarkRestore]:       '<span class="subtitle">Error while restoring configuration after Role switch</span>\n'
};

function markup (err, msgMarkup, opts = {}) {
    msgMarkup = dedent(`
        ${SUBTITLES[err.testRunPhase]}<div class="message">${dedent(msgMarkup)}</div>

        <strong>Browser:</strong> <span class="user-agent">${err.userAgent}</span>
    `);

    if (err.screenshotPath)
        msgMarkup += `\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    if (!opts.withoutCallsite) {
        var callsiteMarkup = err.getCallsiteMarkup();

        if (callsiteMarkup)
            msgMarkup += `\n\n${callsiteMarkup}`;
    }

    return msgMarkup;
}

export default {
    [TYPE.actionIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TYPE.actionPositiveIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [TYPE.actionSpeedOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a number between 0.01 and 1, but it was ${err.actualValue}.
    `),

    [TYPE.pageLoadError]: err => markup(err, `
        ${err.errMsg}
    `),

    [TYPE.uncaughtErrorOnPage]: err => markup(err, `
        Error on page <a href="${err.pageDestUrl}">${err.pageDestUrl}</a>:

        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.uncaughtErrorInTestCode]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.nativeDialogNotHandledError]: err => markup(err, `
        A native ${err.dialogType} dialog was invoked on page <a href="${err.pageUrl}">${err.pageUrl}</a>, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `),

    [TYPE.uncaughtErrorInNativeDialogHandler]: err => markup(err, `
        An error occurred in the native dialog handler called for a native ${err.dialogType} dialog on page <a href="${err.pageUrl}">${err.pageUrl}</a>:

        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.setTestSpeedArgumentError]: err => markup(err, `
        Speed is expected to be a number between 0.01 and 1, but ${err.actualValue} was passed.
    `),

    [TYPE.setNativeDialogHandlerCodeWrongTypeError]: err => markup(err, `
        The native dialog handler is expected to be a function, ClientFunction or null, but it was ${err.actualType}.
    `),

    [TYPE.uncaughtErrorInClientFunctionCode]: err => markup(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.uncaughtErrorInCustomDOMPropertyCode]: err => markup(err, `
        An error occurred when trying to calculate a custom Selector property "${err.property}":

        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.clientFunctionExecutionInterruptionError]: err => markup(err, `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.
    `),

    [TYPE.uncaughtNonErrorObjectInTestCode]: err => markup(err, `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw Error instead.
    `, { withoutCallsite: true }),

    [TYPE.actionOptionsTypeError]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.
    `),

    [TYPE.actionStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
    `),

    [TYPE.actionNullableStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a null or a string, but it was ${err.actualValue}.
    `),

    [TYPE.actionStringOrStringArrayArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.
    `),

    [TYPE.actionStringArrayElementError]: err => markup(err, `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.
    `),

    [TYPE.actionIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TYPE.actionRoleArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a Role instance, but it was ${err.actualValue}.
    `),

    [TYPE.actionPositiveIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TYPE.actionElementNotFoundError]: err => markup(err, `
        The specified selector does not match any element in the DOM tree.
    `),

    [TYPE.actionElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified selector is not visible.
    `),

    [TYPE.actionSelectorMatchesWrongNodeTypeError]: err => markup(err, `
        The specified selector is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TYPE.actionAdditionalElementNotFoundError]: err => markup(err, `
        The specified "${err.argumentName}" does not match any element in the DOM tree.
    `),

    [TYPE.actionAdditionalElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is not visible.
    `),

    [TYPE.actionAdditionalSelectorMatchesWrongNodeTypeError]: err => markup(err, `
        The specified "${err.argumentName}" is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TYPE.actionElementNonEditableError]: err => markup(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).
    `),

    [TYPE.actionElementNonContentEditableError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.
    `),

    [TYPE.actionRootContainerNotFoundError]: err => markup(err, `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.
    `),

    [TYPE.actionElementIsNotFileInputError]: err => markup(err, `
        The specified selector does not match a file input element.
    `),

    [TYPE.actionCanNotFindFileToUploadError]: err => markup(err, `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => `  ${escapeHtml(path)}`).join('\n')}
    `),

    [TYPE.actionElementNotTextAreaError]: err => markup(err, `
        The action element is expected to be a &lt;textarea&gt;.
    `),

    [TYPE.actionElementNotIframeError]: err => markup(err, `
        The action element is expected to be an &lt;iframe&gt.
    `),

    [TYPE.actionIncorrectKeysError]: err => markup(err, `
        The "${err.argumentName}" argument contains an incorrect key or key combination.
    `),

    [TYPE.actionUnsupportedDeviceTypeError]: err => markup(err, `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to <a href="http://viewportsizes.com">http://viewportsizes.com</a>.
    `),

    [TYPE.actionInvalidScrollTargetError]: err => markup(err, `
        Unable to scroll to the specified point because a point with the specified ${err.properties} is not located inside the element's cropping region.
    `),

    [TYPE.actionIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe to which you are switching did not load.
    `),

    [TYPE.currentIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe in which the test is currently operating did not load.
    `),

    [TYPE.currentIframeNotFoundError]: err => markup(err, `
        The iframe in which the test is currently operating does not exist anymore.
    `),

    [TYPE.currentIframeIsInvisibleError]: err => markup(err, `
        The iframe in which the test is currently operating is not visible anymore.
    `),

    [TYPE.missingAwaitError]: err => markup(err, `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.
    `),

    [TYPE.externalAssertionLibraryError]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.domNodeClientFunctionResultError]: err => markup(err, `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.
    `),

    [TYPE.invalidSelectorResultError]: err => markup(err, `
        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.
    `),

    [TYPE.actionSelectorError]: err => markup(err, `
        Action "${err.selectorName}" argument error:

        ${escapeHtml(err.errMsg)}
    `),

    [TYPE.cantObtainInfoForElementSpecifiedBySelectorError]: err => markup(err, `
        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.
    `),

    [TYPE.windowDimensionsOverflowError]: err => markup(err, `
        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.
    `),

    [TYPE.invalidElementScreenshotDimensionsError]: err => markup(err, `
         Unable to capture an element image because the resulting image ${err.dimensions} ${err.verb} zero or negative.
    `),

    [TYPE.roleSwitchInRoleInitializerError]: err => markup(err, `
        Role cannot be switched while another role is being initialized.
    `),

    [TYPE.assertionExecutableArgumentError]: err => markup(err, `
        Cannot evaluate the "${err.actualValue}" expression in the "${err.argumentName}" parameter because of the following error:

        ${err.errMsg}
    `),

    [TYPE.requestHookConfigureAPIError]: err => markup(err, `
        There was an error while configuring the request hook:
        
        ${err.requestHookName}: ${err.errMsg}
    `),

    [TYPE.assertionUnawaitedPromiseError]: err => markup(err, `
        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.
    `)
};
