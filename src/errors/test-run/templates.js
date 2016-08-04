import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';
import TEST_RUN_STATE from '../../test-run/state';

function markup (err, msgMarkup, opts = {}) {
    var subtitle = '';

    if (err.testRunState === TEST_RUN_STATE.inBeforeEach)
        subtitle = `<span class="subtitle">Error in beforeEach hook</span>\n`;

    else if (err.testRunState === TEST_RUN_STATE.inAfterEach)
        subtitle = `<span class="subtitle">Error in afterEach hook</span>\n`;

    msgMarkup = dedent(`
        ${subtitle}<div class="message">${dedent(msgMarkup)}</div>

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
    [TYPE.actionPositiveIntegerOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
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

    [TYPE.uncaughtErrorInClientFunctionCode]: err => markup(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

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

    [TYPE.actionUnsupportedUrlProtocolError]: err => markup(err, `
        The "${err.argumentName}" argument specifies a URL that uses an unsupported ${err.protocol}:// protocol. Only HTTP and HTTPS are supported, as well as protocol-relative and relative URLs.
    `),

    [TYPE.actionStringArgumentError]: err => markup(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
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
    `)
};
