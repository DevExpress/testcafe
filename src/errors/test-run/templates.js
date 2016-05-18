import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';
import TEST_RUN_STATE from '../../test-run/state';

function markup (err, msgMarkup) {
    var prefix = dedent(`
        <span class="user-agent">${err.userAgent}</span>
        <span class="category">${err.category}</span>
    `);

    if (err.testRunState === TEST_RUN_STATE.inBeforeEach)
        prefix += `<strong>- Error in <code>beforeEach</code> hook -</strong>\n`;

    else if (err.testRunState === TEST_RUN_STATE.inAfterEach)
        prefix += `<strong>- Error in <code>afterEach</code> hook -</strong>\n`;

    msgMarkup = prefix + dedent(msgMarkup);

    if (err.screenshotPath)
        msgMarkup += `\n\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    return msgMarkup;
}

export default {
    [TYPE.actionIntegerOptionError]: err => markup(err, `
        The <code>${err.optionName}</code> option is expected to be an integer, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionPositiveIntegerOptionError]: err => markup(err, `
        The <code>${err.optionName}</code> option is expected to be a positive integer, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        The <code>${err.optionName}</code> option is expected to be a boolean value, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorOnPage]: err => markup(err, `
        Error on page <a href="${err.pageDestUrl}">${err.pageDestUrl}</a>:

        <code>${escapeHtml(err.errMsg)}</code>

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorInTestCode]: err => markup(err, `
        <code>${escapeHtml(err.errMsg)}</code>

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorInClientExecutedCode]: err => markup(err, `
        An error occurred in code executed on the client:

        <code>${escapeHtml(err.errMsg)}</code>

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.clientCodeExecutionInterruptionError]: err => markup(err, `
        Client code execution was interrupted by page unload. This problem may appear if you trigger page navigation from client code.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtNonErrorObjectInTestCode]: err => markup(err, `
        Uncaught ${err.objType} "${escapeHtml(err.objStr)}" was thrown. Throw <code>Error</code> instead.
    `),

    [TYPE.actionSelectorTypeError]: err => markup(err, `
        The selector is expected to be a string, but it was <code>${err.actualType}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionOptionsTypeError]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was <code>${err.actualType}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionAdditionalSelectorTypeError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument is expected to be a string, but it was <code>${err.actualType}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionUnsupportedUrlProtocolError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument specifies a URL that uses an unsupported <code>${err.protocol}://</code> protocol. Only HTTP and HTTPS are supported, as well as protocol-relative and relative URLs.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringArgumentError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument is expected to be a non-empty string, but it was <code>${err.actualValue}</code>.

         ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringOrStringArrayArgumentError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionStringArrayElementError]: err => markup(err, `
        Elements of the <code>${err.argumentName}</code> argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionIntegerArgumentError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument is expected to be an integer, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionPositiveIntegerArgumentError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument is expected to be a positive integer, but it was <code>${err.actualValue}</code>.

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
        The specified <code>${err.argumentName}</code> does not match any element in the DOM tree.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionAdditionalElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified <code>${err.argumentName}</code> is not visible.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNonEditableError]: err => markup(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNonContentEditableError]: err => markup(err, `
        The element that matches the specified <code>${err.argumentName}</code> is expected to have the contentEditable attribute enabled or the entire document should be in design mode.

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
        ${err.filePaths
            .map(path => `<code>${escapeHtml(path)}</code>`)
            .join(', ')
        }

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNotTextAreaError]: err => markup(err, `
        The action element is expected to be a textarea.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionIncorrectKeysError]: err => markup(err, `
        The <code>${err.argumentName}</code> argument contains an incorrect key or key combination.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.missingAwaitError]: err => markup(err, `
        A call to an async function is not awaited. Use the <code>await</code> keyword before actions, assertions or chains of them to ensure that they run in the right sequence.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.externalAssertionLibraryError]: err => markup(err, `
        ${escapeHtml(err.errMsg)} ${err.getCallsiteMarkup({ stackOnly: true })}
    `)
};
