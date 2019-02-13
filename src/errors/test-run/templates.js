import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import { TEST_RUN_ERRORS } from '../types';
import renderForbiddenCharsList from '../render-forbidden-chars-list';
import { replaceLeadingSpacesWithNbsp } from '../../utils/string';
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

const EXTERNAL_LINKS = {
    createNewIssue: 'https://github.com/DevExpress/testcafe/issues/new?template=bug-report.md',
    viewportSizes:  'http://viewportsizes.com'
};

function formatUrl (url) {
    return `<a href="${url}">${url}</a>`;
}

function formatSelectorCallstack (apiFnChain, apiFnIndex, viewportWidth) {
    if (typeof apiFnIndex === 'undefined')
        return '';

    const emptySpaces    = 10;
    const ellipsis       = '...)';
    const availableWidth = viewportWidth - emptySpaces;

    return apiFnChain.map((apiFn, index) => {
        let formattedApiFn = String.fromCharCode(160);

        formattedApiFn += index === apiFnIndex ? '>' : ' ';
        formattedApiFn += ' | ';
        formattedApiFn += index !== 0 ? '  ' : '';
        formattedApiFn += apiFn;

        if (formattedApiFn.length > availableWidth)
            return formattedApiFn.substr(0, availableWidth - emptySpaces) + ellipsis;

        return formattedApiFn;
    }).join('\n');
}

function markup (err, msgMarkup, opts = {}) {
    msgMarkup = dedent(`
        ${SUBTITLES[err.testRunPhase]}<div class="message">${dedent(msgMarkup)}</div>

        <strong>Browser:</strong> <span class="user-agent">${err.userAgent}</span>
    `);

    if (err.screenshotPath)
        msgMarkup += `\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    if (!opts.withoutCallsite) {
        const callsiteMarkup = err.getCallsiteMarkup();

        if (callsiteMarkup)
            msgMarkup += `\n\n${callsiteMarkup}`;
    }

    return msgMarkup
        .replace('\t', '&nbsp;'.repeat(4));
}

export default {
    [TEST_RUN_ERRORS.actionIntegerOptionError.name]: err => markup(err, `
        The "${err.optionName}" option is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionPositiveIntegerOptionError.name]: err => markup(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionBooleanOptionError.name]: err => markup(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionSpeedOptionError.name]: err => markup(err, `
        The "${err.optionName}" option is expected to be a number between 0.01 and 1, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.pageLoadError.name]: err => markup(err, `
        ${err.errMsg}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorOnPage.name]: err => markup(err, `
        A JavaScript error occurred on ${formatUrl(err.pageDestUrl)}.
        At this moment, TestCafe tracks uncaught JavaScript errors on the page. Try to manually perform the test scenario.
        If this error still occurs then it means you site has uncaught JavaScript errors. To disable JavaScript error tracking you can turn the --skip-js-errors option on.
        If the error occurs only with TestCafe then it is a bug. Write a new issue about it at:
        ${formatUrl(EXTERNAL_LINKS.createNewIssue)}.

        JavaScript error details:
        ${replaceLeadingSpacesWithNbsp(escapeHtml(err.errStack))}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInTestCode.name]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.nativeDialogNotHandledError.name]: err => markup(err, `
        A native ${err.dialogType} dialog was invoked on page ${formatUrl(err.pageUrl)}, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `),

    [TEST_RUN_ERRORS.nativeDialogNotHandledError.name]: err => markup(err, `
        A native ${err.dialogType} dialog was invoked on page <a href="${err.pageUrl}">${err.pageUrl}</a>, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler.name]: err => markup(err, `
        An error occurred in the native dialog handler called for a native ${err.dialogType} dialog on page <a href="${err.pageUrl}">${err.pageUrl}</a>:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.setTestSpeedArgumentError.name]: err => markup(err, `
        Speed is expected to be a number between 0.01 and 1, but ${err.actualValue} was passed.
    `),

    [TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError.name]: err => markup(err, `
        The native dialog handler is expected to be a function, ClientFunction or null, but it was ${err.actualType}.
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode.name]: err => markup(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode.name]: err => markup(err, `
        An error occurred when trying to calculate a custom Selector property "${err.property}":

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError.name]: err => markup(err, `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.
    `),

    [TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode.name]: err => markup(err, `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw Error instead.
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.unhandledPromiseRejection.name]: err => markup(err, `
        Unhandled promise rejection:

        ${escapeHtml(err.errMsg)}
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.uncaughtException.name]: err => markup(err, `
        Uncaught exception:

        ${escapeHtml(err.errMsg)}
    `, { withoutCallsite: true }),

    [TEST_RUN_ERRORS.actionOptionsTypeError.name]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.
    `),

    [TEST_RUN_ERRORS.actionStringArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionBooleanArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionNullableStringArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a null or a string, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionStringArrayElementError.name]: err => markup(err, `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionIntegerArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionRoleArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a Role instance, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionPositiveIntegerArgumentError.name]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TEST_RUN_ERRORS.actionElementNotFoundError.name]: (err, viewportWidth) => markup(err, `
        The specified selector does not match any element in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.actionElementIsInvisibleError.name]: err => markup(err, `
        The element that matches the specified selector is not visible.
    `),

    [TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError.name]: err => markup(err, `
        The specified selector is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TEST_RUN_ERRORS.actionAdditionalElementNotFoundError.name]: (err, viewportWidth) => markup(err, `
        The specified "${err.argumentName}" does not match any element in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError.name]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is not visible.
    `),

    [TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError.name]: err => markup(err, `
        The specified "${err.argumentName}" is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [TEST_RUN_ERRORS.actionElementNonEditableError.name]: err => markup(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).
    `),

    [TEST_RUN_ERRORS.actionElementNonContentEditableError.name]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.
    `),

    [TEST_RUN_ERRORS.actionRootContainerNotFoundError.name]: err => markup(err, `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.
    `),

    [TEST_RUN_ERRORS.actionElementIsNotFileInputError.name]: err => markup(err, `
        The specified selector does not match a file input element.
    `),

    [TEST_RUN_ERRORS.actionCanNotFindFileToUploadError.name]: err => markup(err, `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => `  ${escapeHtml(path)}`).join('\n')}
    `),

    [TEST_RUN_ERRORS.actionElementNotTextAreaError.name]: err => markup(err, `
        The action element is expected to be a &lt;textarea&gt;.
    `),

    [TEST_RUN_ERRORS.actionElementNotIframeError.name]: err => markup(err, `
        The action element is expected to be an &lt;iframe&gt.
    `),

    [TEST_RUN_ERRORS.actionIncorrectKeysError.name]: err => markup(err, `
        The "${err.argumentName}" argument contains an incorrect key or key combination.
    `),

    [TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError.name]: err => markup(err, `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to ${formatUrl(EXTERNAL_LINKS.viewportSizes)}.
    `),

    [TEST_RUN_ERRORS.actionInvalidScrollTargetError.name]: err => markup(err, `
        Unable to scroll to the specified point because a point with the specified ${err.properties} is not located inside the element's cropping region.
    `),

    [TEST_RUN_ERRORS.actionIframeIsNotLoadedError.name]: err => markup(err, `
        Content of the iframe to which you are switching did not load.
    `),

    [TEST_RUN_ERRORS.currentIframeIsNotLoadedError.name]: err => markup(err, `
        Content of the iframe in which the test is currently operating did not load.
    `),

    [TEST_RUN_ERRORS.currentIframeNotFoundError.name]: err => markup(err, `
        The iframe in which the test is currently operating does not exist anymore.
    `),

    [TEST_RUN_ERRORS.currentIframeIsInvisibleError.name]: err => markup(err, `
        The iframe in which the test is currently operating is not visible anymore.
    `),

    [TEST_RUN_ERRORS.missingAwaitError.name]: err => markup(err, `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.
    `),

    [TEST_RUN_ERRORS.externalAssertionLibraryError.name]: err => markup(err, `
        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.domNodeClientFunctionResultError.name]: err => markup(err, `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.
    `),

    [TEST_RUN_ERRORS.invalidSelectorResultError.name]: err => markup(err, `
        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.
    `),

    [TEST_RUN_ERRORS.actionSelectorError.name]: err => markup(err, `
        Action "${err.selectorName}" argument error:

        ${escapeHtml(err.errMsg)}
    `),

    [TEST_RUN_ERRORS.cantObtainInfoForElementSpecifiedBySelectorError.name]: (err, viewportWidth) => markup(err, `
        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.

        ${ formatSelectorCallstack(err.apiFnChain, err.apiFnIndex, viewportWidth) }
    `),

    [TEST_RUN_ERRORS.windowDimensionsOverflowError.name]: err => markup(err, `
        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.
    `),

    [TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError.name]: err => markup(err, `
        There are forbidden characters in the "${err.screenshotPath}" screenshot path:
        ${renderForbiddenCharsList(err.forbiddenCharsList)}
    `),

    [TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError.name]: err => markup(err, `
         Unable to capture an element image because the resulting image ${err.dimensions} ${err.verb} zero or negative.
    `),

    [TEST_RUN_ERRORS.roleSwitchInRoleInitializerError.name]: err => markup(err, `
        Role cannot be switched while another role is being initialized.
    `),

    [TEST_RUN_ERRORS.assertionExecutableArgumentError.name]: err => markup(err, `
        Cannot evaluate the "${err.actualValue}" expression in the "${err.argumentName}" parameter because of the following error:

        ${err.errMsg}
    `),

    [TEST_RUN_ERRORS.assertionWithoutMethodCallError.name]: err => markup(err, `
        An assertion method is not specified.
    `),

    [TEST_RUN_ERRORS.assertionUnawaitedPromiseError.name]: err => markup(err, `
        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.
    `)
};
