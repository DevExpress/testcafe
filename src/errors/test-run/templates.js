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
        Action option <code>${err.optionName}</code> is expected to be an integer, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionPositiveIntegerOptionError]: err => markup(err, `
        Action option <code>${err.optionName}</code> is expected to be a positive integer, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        Action option <code>${err.optionName}</code> is expected to be a boolean value, but it was <code>${err.actualValue}</code>.

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

    [TYPE.dragDestinationSelectorTypeError]: err => markup(err, `
        The destination selector is expected to be a string, but it was <code>${err.actualType}</code>.

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

    [TYPE.dragDestinationNotFoundError]: err => markup(err, `
        The specified destination selector does not match any element in the DOM tree.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.dragDestinationIsInvisibleError]: err => markup(err, `
        The element that matches the specified destination selector is not visible.

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
