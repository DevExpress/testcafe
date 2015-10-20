import dedent from 'dedent';
import CATEGORY from './category';
import TYPE from './type';
import buildDiff from './assertion-diffs';

function escapeNewLines (str) {
    return str.replace(/(\r\n|\n|\r)/gm, '\\n');
}

function getStepCode (str) {
    var lines = str.split(/\r?\n/g);
    var last  = lines.pop();

    return lines
        .reduceRight((prev, line) => `<span data-type="code-line">${line}</span>${prev}`,
        `<span data-type="last-code-line">${last}</span>`);
}

function getMsgPrefix (err, category) {
    return dedent`
        <span data-type="user-agent">${err.userAgent}</span>
        <span data-type="category">${category}</span>
    `;
}

function getAssertionMsgPrefix (err) {
    var assertionPrefix = err.message ? `"${err.message}" assertion` : 'Assertion';

    return getMsgPrefix(err, CATEGORY.failedAssertion) + assertionPrefix;
}

function getDiffHeader (err) {
    if (err.isArrays)
        return `Arrays differ at index <code>${err.key}</code>:`;

    if (err.isObjects)
        return `Objects differ at the <code>${err.key}</code> field:`;

    if (err.isStrings)
        return `Strings differ at index <code>${err.key}</code>:`;

    return '';
}

function getScreenshotInfoStr (err) {
    if (err.screenshotPath)
        return `<div data-type="screenshot-info">Screenshot: <a data-type="screenshot-path">${err.screenshotPath}</a></div>`;

    return '';
}

export default {
    [TYPE.okAssertion]: err => dedent`
        ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <strong>Expected: </strong>not <code>null</code>, not <code>undefined</code>, not <code>false</code>, not <code>NaN</code> and not <code>''</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.notOkAssertion]: err => dedent`
        ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <strong>Expected: </strong><code>null</code>, <code>undefined</code>, <code>false</code>, <code>NaN</code> or <code>''</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.eqAssertion]: (err, maxStringLength) => {
        var diff          = buildDiff(err, maxStringLength);
        var diffMarkerStr = diff.marker ? `          ${diff.marker}` : '';

        return dedent`
            ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

            <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

            ${getDiffHeader(err)}

            <strong>Expected: </strong><code>${escapeNewLines(diff.expected)}</code>
            <strong>Actual:   </strong><code>${escapeNewLines(diff.actual)}</code>
            <code>${diffMarkerStr}</code>

            ${getScreenshotInfoStr(err)}
        `;
    },

    [TYPE.notEqAssertion]: err => dedent`
        ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <strong>Expected: </strong>not <code>${escapeNewLines(err.actual)}</code>
        <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.iframeLoadingTimeout]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.timeout)}IFrame loading timed out.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.inIFrameTargetLoadingTimeout]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.timeout)}Error at step <span data-type="step-name">${err.stepName}</span>:
        IFrame target loading timed out.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.uncaughtJSError]: err => {
        if (err.pageUrl) {
            return dedent`
                ${getMsgPrefix(err, CATEGORY.unhandledException)}Uncaught JavaScript error <code>${err.scriptErr}</code> on page <a href="${err.pageUrl}">${err.pageUrl}</a>

                ${getScreenshotInfoStr(err)}
            `;
        }

        return dedent`
            ${getMsgPrefix(err, CATEGORY.unhandledException)}Uncaught JavaScript error <code>${err.scriptErr}</code> on page.

            ${getScreenshotInfoStr(err)}
        `;
    },

    [TYPE.uncaughtJSErrorInTestCodeStep]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.unhandledException)}Error at step <span data-type="step-name">${err.stepName}</span>:
        Uncaught JavaScript error in test code - <code>${err.scriptErr}</code>.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.storeDomNodeOrJqueryObject]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.unhandledException)}Error at step <span data-type="step-name">${err.stepName}</span>:
        It is not allowed to share the DOM element, jQuery object or a function between test steps via "this" object.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.emptyFirstArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        A target element of the <code data-type="api">${err.action}</code> action has not been found in the DOM tree.
        If this element should be created after animation or a time-consuming operation is finished, use the <code data-type="api">waitFor</code> action (available for use in code) to pause test execution until this element appears.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.invisibleActionElement]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        A target element <code>${err.element}</code> of the <code data-type="api">${err.action}</code> action is not visible.
        If this element should appear when you are hovering over another element, make sure that you properly recorded the <code data-type="api">hover</code> action.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectDraggingSecondArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">drag</code> action drop target is incorrect.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectPressActionArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">press</code> action parameter contains incorrect key code.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.emptyTypeActionArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        The <code data-type="api">type<code> action's parameter text is empty.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.unexpectedDialog]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.nativeDialogError)}Error at step <span data-type="step-name">${err.stepName}</span>:
        Unexpected system <code>${err.dialog}</code> dialog <code>${err.message}</code> appeared.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.expectedDialogDoesntAppear]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.nativeDialogError)}Error at step <span data-type="step-name">${err.stepName}</span>:
        The expected system <code>${err.dialog}</code> dialog did not appear.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectSelectActionArguments]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">select</code> action's parameters contain an incorrect value.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectWaitActionMillisecondsArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">wait</code> action's "milliseconds" parameter should be a positive number.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectWaitForActionEventArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">waitFor</code> action's first parameter should be a function, a CSS selector or an array of CSS selectors.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectWaitForActionTimeoutArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">waitFor</code> action's "timeout" parameter should be a positive number.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.waitForActionTimeoutExceeded]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.timeout)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">waitFor</code> action's timeout exceeded.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.emptyIFrameArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        The selector within the <code data-type="api">inIFrame</code> function returns an empty value.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.iframeArgumentIsNotIFrame]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        The selector within the <code data-type="api">inIFrame</code> function doesn’t return an iframe element.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.multipleIFrameArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        The selector within the <code data-type="api">inIFrame</code> function returns more than one iframe element.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.incorrectIFrameArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        The <code data-type="api">inIFrame</code> function contains an invalid argument.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.uploadCanNotFindFileToUpload]: err => {
        var msg = dedent`
            ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

            <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

            Cannot find the following file(s) to upload:
        `;

        return msg +
               err.filePaths.map(path => `\n    <code>${path}</code>`).join(',') +
               (err.screenshotPath ? `\n\n${getScreenshotInfoStr(err)}` : '');
    },

    [TYPE.uploadElementIsNotFileInput]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">upload</code> action argument does not contain a file input element.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.uploadInvalidFilePathArgument]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.actionError)}Error at step <span data-type="step-name">${err.stepName}</span>:

        <code data-type="step-source">${getStepCode(err.relatedSourceCode)}</code>

        <code data-type="api">upload</code> action's "path" parameter should be a string or an array of strings.

        ${getScreenshotInfoStr(err)}
    `,

    [TYPE.pageNotLoaded]: err => dedent`
        ${getMsgPrefix(err, CATEGORY.pageLoadError)}${err.message}
    `
};
