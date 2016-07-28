import dedent from 'dedent';
import { escape as escapeHtml } from 'lodash';
import TYPE from './type';
import buildDiff from './assertion-diffs';

function escapeNewLines (str) {
    return escapeHtml(str).replace(/(\r\n|\n|\r)/gm, '\\n');
}

function getAssertionMsgPrefix (err) {
    return err.message ? `"${escapeHtml(err.message)}" assertion` : 'Assertion';
}

function getDiffHeader (err) {
    if (err.isArrays)
        return `Arrays differ at index <code>${err.key}</code>:`;

    if (err.isObjects)
        return `Objects differ at the <code>${escapeHtml(err.key)}</code> field:`;

    if (err.isStrings)
        return `Strings differ at index <code>${err.key}</code>:`;

    return '';
}

function markup (err, msgMarkup, opts = {}) {
    msgMarkup = dedent(`
        <div class="message">${dedent(msgMarkup)}</div>

        <strong>Browser:</strong> <span class="user-agent">${err.userAgent}</span>
    `);

    if (err.screenshotPath)
        msgMarkup += `\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${escapeHtml(err.screenshotPath)}</a></div>`;

    if (!opts.withoutCallsite) {
        var callsiteMarkup = err.getCallsiteMarkup();

        if (callsiteMarkup)
            msgMarkup += `\n\n<strong>Code:</strong>\n${callsiteMarkup}`;
    }

    return msgMarkup;
}

export default {
    [TYPE.okAssertion]: err => markup(err, `
        ${getAssertionMsgPrefix(err)} failed at step "${escapeHtml(err.stepName)}":

        <strong>Expected: </strong>not <code>null</code>, not <code>undefined</code>, not <code>false</code>, not <code>NaN</code> and not <code>''</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
    `),

    [TYPE.notOkAssertion]: err => markup(err, `
        ${getAssertionMsgPrefix(err)} failed at step "${escapeHtml(err.stepName)}":

        <strong>Expected: </strong><code>null</code>, <code>undefined</code>, <code>false</code>, <code>NaN</code> or <code>''</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
    `),

    [TYPE.eqAssertion]: (err, maxStringLength) => {
        var diff          = buildDiff(err, maxStringLength);
        var diffMarkerStr = diff.marker ? `          ${diff.marker}` : '';

        return markup(err, `
            ${getAssertionMsgPrefix(err)} failed at step "${escapeHtml(err.stepName)}":

            ${getDiffHeader(err)}

            <strong>Expected: </strong><code>${escapeNewLines(diff.expected)}</code>
            <strong>Actual:   </strong><code>${escapeNewLines(diff.actual)}</code>
            <code>${diffMarkerStr}</code>
        `);
    },

    [TYPE.notEqAssertion]: err => markup(err, `
        ${getAssertionMsgPrefix(err)} failed at step "${escapeHtml(err.stepName)}":

        <strong>Expected: </strong>not <code>${escapeNewLines(err.actual)}</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
    `),

    [TYPE.iframeLoadingTimeout]: err => markup(err, `
        IFrame loading timed out.
    `),

    [TYPE.inIFrameTargetLoadingTimeout]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        IFrame target loading timed out.
    `),

    [TYPE.uncaughtJSError]: err => {
        if (err.pageDestUrl) {
            return markup(err, `
                Uncaught JavaScript error <code>${escapeHtml(err.scriptErr)}</code> on page <a href="${err.pageDestUrl}">${err.pageDestUrl}</a>
            `);
        }

        return markup(err, `
            Uncaught JavaScript error <code>${escapeHtml(err.scriptErr)}</code> on page.
        `);
    },

    [TYPE.uncaughtJSErrorInTestCodeStep]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        Uncaught JavaScript error in test code - <code>${escapeHtml(err.scriptErr)}</code>.
    `),

    [TYPE.storeDomNodeOrJqueryObject]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        It is not allowed to share the DOM element, jQuery object or a function between test steps via "this" object.
    `),

    [TYPE.emptyFirstArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        A target element of the <code>${err.action}</code> action has not been found in the DOM tree.
        If this element should be created after animation or a time-consuming operation is finished, use the <code>waitFor</code> action (available for use in code) to pause test execution until this element appears.
    `),

    [TYPE.invisibleActionElement]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        A target element <code>${escapeHtml(err.element)}</code> of the <code>${err.action}</code> action is not visible.
        If this element should appear when you are hovering over another element, make sure that you properly recorded the <code>hover</code> action.
    `),

    [TYPE.incorrectDraggingSecondArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>drag</code> action drop target is incorrect.
    `),

    [TYPE.incorrectPressActionArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>press</code> action parameter contains incorrect key code.
    `),

    [TYPE.emptyTypeActionArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The <code>type<code> action's parameter text is empty.
    `),

    [TYPE.unexpectedDialog]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        Unexpected system <code>${err.dialog}</code> dialog <code>${escapeHtml(err.message)}</code> appeared.
    `),

    [TYPE.expectedDialogDoesntAppear]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The expected system <code>${err.dialog}</code> dialog did not appear.
    `),

    [TYPE.incorrectSelectActionArguments]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>select</code> action's parameters contain an incorrect value.
    `),

    [TYPE.incorrectWaitActionMillisecondsArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>wait</code> action's "milliseconds" parameter should be a positive number.
    `),

    [TYPE.incorrectWaitForActionEventArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>waitFor</code> action's first parameter should be a function, a CSS selector or an array of CSS selectors.
    `),

    [TYPE.incorrectWaitForActionTimeoutArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>waitFor</code> action's "timeout" parameter should be a positive number.
    `),

    [TYPE.waitForActionTimeoutExceeded]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>waitFor</code> action's timeout exceeded.
    `),

    [TYPE.incorrectGlobalWaitForActionEventArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>__waitFor</code> action's first parameter should be a function.
    `),

    [TYPE.incorrectGlobalWaitForActionTimeoutArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>__waitFor</code> action's "timeout" parameter should be a positive number.
    `),

    [TYPE.globalWaitForActionTimeoutExceeded]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>__waitFor</code> action's timeout exceeded.
    `),

    [TYPE.emptyIFrameArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The selector within the <code>inIFrame</code> function returns an empty value.
    `),

    [TYPE.iframeArgumentIsNotIFrame]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The selector within the <code>inIFrame</code> function doesn’t return an iframe element.
    `),

    [TYPE.multipleIFrameArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The selector within the <code>inIFrame</code> function returns more than one iframe element.
    `),

    [TYPE.incorrectIFrameArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        The <code>inIFrame</code> function contains an invalid argument.
    `),

    [TYPE.uploadCanNotFindFileToUpload]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        Cannot find the following file(s) to upload:

        ${err.filePaths.map(path => `<code>${escapeHtml(path)}</code>`).join(',\n')}
    `),

    [TYPE.uploadElementIsNotFileInput]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>upload</code> action argument does not contain a file input element.
    `),

    [TYPE.uploadInvalidFilePathArgument]: err => markup(err, `
        Error at step "${escapeHtml(err.stepName)}":
        <code>upload</code> action's "path" parameter should be a string or an array of strings.
    `),

    [TYPE.pageNotLoaded]: err => markup(err, `
        ${err.message}
    `)
};
