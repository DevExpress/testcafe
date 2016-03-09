import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';

function markup (err, msgMarkup) {
    msgMarkup = dedent(msgMarkup);

    msgMarkup = dedent(`
        <span class="user-agent">${err.userAgent}</span>
        <span class="category">${err.category}</span>
    `) + msgMarkup;

    if (err.screenshotPath)
        msgMarkup += `\n\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    return msgMarkup;
}

export default {
    [TYPE.actionNumberOptionError]: err => markup(err, `
        Action option <code>${err.optionName}</code> is expected to be a number, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionPositiveNumberOptionError]: err => markup(err, `
        Action option <code>${err.optionName}</code> is expected to be a positive number, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionBooleanOptionError]: err => markup(err, `
        Action option <code>${err.optionName}</code> is expected to be a boolean value, but it was <code>${err.actualValue}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.uncaughtErrorOnPage]: err => markup(err, `
        Uncaught JavaScript error <code>${escapeHtml(err.scriptErr)}</code> on page <a href="${err.pageDestUrl}">${err.pageDestUrl}</a>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionSelectorTypeError]: err => markup(err, `
        Action selector is expected to be a string, but it was <code>${err.actualType}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionOptionsTypeError]: err => markup(err, `
        Action options is expected to be an object, null or undefined but it was <code>${err.actualType}</code>.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementNotFoundError]: err => markup(err, `
        The specified selector does not match any element in the DOM tree.

        ${err.getCallsiteMarkup()}
    `),

    [TYPE.actionElementIsInvisibleError]: err => markup(err, `
        The element that matches the specified selector is not visible.

        ${err.getCallsiteMarkup()}
    `)
};
