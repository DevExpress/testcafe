import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';
import TEST_RUN_STATE from '../../test-run/state';

function markup (err, msgMarkup) {
    var prefix = `<span class="user-agent">${err.userAgent}</span>\n`;

    if (err.testRunState === TEST_RUN_STATE.inBeforeEach)
        prefix += `<span class="subtitle">Error in beforeEach hook</span>`;

    else if (err.testRunState === TEST_RUN_STATE.inAfterEach)
        prefix += `<span class="subtitle">Error in afterEach hook</span>`;

    msgMarkup = prefix + dedent(msgMarkup);

    if (err.screenshotPath)
        msgMarkup += `\n\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    return msgMarkup;
}

export default {
    [TYPE.actionPositiveIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.pageLoadError]: err => markup(err, `
        ${err.errMsg}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorOnPage]: err => markup(err, `
        Error on page <a href="${err.pageDestUrl}">${err.pageDestUrl}</a>:

        ${escapeHtml(err.errMsg)}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorInTestCode]: err => markup(err, `
        ${escapeHtml(err.errMsg)}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorInClientFunctionCode]: err => markup(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${escapeHtml(err.errMsg)}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.clientFunctionExecutionInterruptionError]: err => markup(err, `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtNonErrorObjectInTestCode]: err => markup(err, `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw Error instead.
    `),

    [TYPE.actionOptionsTypeError]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionUnsupportedUrlProtocolError]: err => markup(err, `
        The "${err.argumentName}" argument specifies a URL that uses an unsupported ${err.protocol}:// protocol. Only HTTP and HTTPS are supported, as well as protocol-relative and relative URLs.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.

         ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringOrStringArrayArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringArrayElementError]: err => markup(err, `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionPositiveIntegerArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNotFoundError]: err => markup(err, `
        The specified selector does not match any element in the DOM tree.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified selector is not visible.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionAdditionalElementNotFoundError]: err => markup(err, `
        The specified "${err.argumentName}" does not match any element in the DOM tree.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionAdditionalElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is not visible.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNonEditableError]: err => markup(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNonContentEditableError]: err => markup(err, `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionRootContainerNotFoundError]: err => markup(err, `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementIsNotFileInputError]: err => markup(err, `
        The specified selector does not match a file input element.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionCanNotFindFileToUploadError]: err => markup(err, `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => `<code>${escapeHtml(path)}</code>`).join(', ')}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNotTextAreaError]: err => markup(err, `
        The action element is expected to be a &lt;textarea&gt;.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNotIframeError]: err => markup(err, `
        The action element is expected to be an &lt;iframe&gt.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionIncorrectKeysError]: err => markup(err, `
        The "${err.argumentName}" argument contains an incorrect key or key combination.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionUnsupportedDeviceTypeError]: err => markup(err, `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to <a href="http://viewportsizes.com">http://viewportsizes.com</a>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe to which you are switching did not load.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.currentIframeIsNotLoadedError]: err => markup(err, `
        Content of the iframe in which the test is currently operating did not load.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.currentIframeNotFoundError]: err => markup(err, `
        The iframe in which the test is currently operating does not exist anymore.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.currentIframeIsInvisibleError]: err => markup(err, `
        The iframe in which the test is currently operating is not visible anymore.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.missingAwaitError]: err => markup(err, `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.externalAssertionLibraryError]: err => markup(err, `
        ${escapeHtml(err.errMsg)}

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.domNodeClientFunctionResultError]: err => markup(err, `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.

       ${err.getCallsiteMarkup()}
    `),

    [TYPE.nonDomNodeSelectorResultError]: err => markup(err, `
        ${err.instantiationCallsiteName} can only return a DOM node, null or undefined. Use ClientFunction to return other values.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionSelectorError]: err => markup(err, `
        Action "${err.selectorName}" argument error:

        ${escapeHtml(err.errMsg)}

        ${err.getCallsiteMarkup()}
    `)
};
