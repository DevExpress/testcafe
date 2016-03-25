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
    `)
};
