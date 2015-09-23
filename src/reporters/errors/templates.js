import CATEGORY from './category';
import TYPE from './type';
import buildDiff from './diffs';

function escapeNewLines (str) {
    return str.replace(/(\r\n|\n|\r)/gm, '\\n');
}

function getMsgPrefix (err) {
    return `${err.userAgent} - `;
}

function getAssertionMsgPrefix (err) {
    var assertionPrefix = err.message !== void 0 && err.message !== null ?
                          `<span data-type="category">${CATEGORY.failedAssertion}</span>"${err.message}" assertion` :
                          `<span data-type="category">${CATEGORY.failedAssertion}</span>Assertion`;

    return getMsgPrefix(err) + assertionPrefix;
}

function getDiffHeader (err) {
    if (err.isArrays)
        return `\nArrays differ at index <code>${err.key}</code>:\n\n`;

    if (err.isObjects)
        return `\nObjects differ at the <code>${err.key}</code> field:\n\n`;

    if (err.isStrings)
        return `\nStrings differ at index <code>${err.key}</code>:\n\n`;

    return '';
}

export default {
    [TYPE.okAssertion]: (err) => {
        return `${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:\n\n` +
               `    <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n\n` +
               `<strong>Expected: </strong>not <code>null</code>, not <code>undefined</code>, ` +
               `not <code>false</code>, not <code>NaN</code> ` +
               `and not <code>''</code>\n` +
               `<strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>`;
    },

    [TYPE.notOkAssertion]: (err) => {
        return `${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:\n\n` +
               `    <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n\n` +
               `<strong>Expected: </strong><code>null</code>, <code>undefined</code>, <code>false</code>, ` +
               `<code>NaN</code> or <code>''</code>\n` +
               `<strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>`;
    },

    [TYPE.eqAssertion]: (err, maxStringLength) => {
        var diff          = buildDiff(err, maxStringLength);
        var diffMarkerStr = diff.marker ? `          ${diff.marker}` : '';

        return `${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:\n\n` +
               `    <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               getDiffHeader(err) +
               `<strong>Expected: </strong><code>${escapeNewLines(diff.expected)}</code>\n` +
               `<strong>Actual:   </strong><code>${escapeNewLines(diff.actual)}</code>\n` +
               `<code>${diffMarkerStr}</code>`;
    },

    [TYPE.notEqAssertion]: (err) => {
        return `${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:\n\n` +
               `    <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n\n` +
               `<strong>Expected: </strong>not <code>${escapeNewLines(err.actual)}</code>\n` +
               `<strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>`;
    },

    [TYPE.xhrRequestTimeout]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>XMLHttpRequest timed out.`;
    },

    [TYPE.iframeLoadingTimeout]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>IFrame loading timed out.`;
    },

    [TYPE.inIFrameTargetLoadingTimeout]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               'IFrame target loading timed out.';
    },

    [TYPE.urlUtilProtocolIsNotSupported]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Failed to process the ` +
               `<a href="${err.destUrl}">${err.destUrl}</a> resource. TestCafe supports only HTTP and HTTPS protocols.`;
    },

    [TYPE.uncaughtJSError]: (err) => {
        if (err.pageUrl) {
            return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Uncaught JavaScript error ` +
                   `<code>${err.scriptErr}</code> on page <a href="${err.pageUrl}">${err.pageUrl}</a>`;
        }

        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Uncaught JavaScript error ` +
               `<code>${err.scriptErr}</code> on page.`;
    },

    [TYPE.uncaughtJSErrorInTestCodeStep]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `Uncaught JavaScript error in test code - <code>${err.scriptErr}</code>.`;
    },

    [TYPE.storeDomNodeOrJqueryObject]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               'It is not allowed to share the DOM element, jQuery object or a function between test steps ' +
               'via "this" object.';
    },

    [TYPE.emptyFirstArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               `A target element of the <code>${err.action}</code> action has not been found in the DOM tree. ` +
               'If this element should be created after animation or a time-consuming operation is finished, ' +
               'use the act.waitFor action (available for use in code) to pause test execution until this element appears.';
    },

    [TYPE.invisibleActionElement]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               `A target element of the <code>${err.action}</code> action (<code>${err.element}</code>) ` +
               'is not visible. If this element should appear when you are hovering over another element, ' +
               'make sure that you properly recorded the Hover action.';

    },

    [TYPE.incorrectDraggingSecondArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               `"<code>${err.action || ''}</code>" action drop target is incorrect.`;
    },

    [TYPE.incorrectPressActionArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'press action parameter contains incorrect key code.';
    },

    [TYPE.emptyTypeActionArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'The type action\'s parameter text is empty.';
    },

    [TYPE.unexpectedDialog]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.nativeDialogError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `Unexpected system <code>${err.dialog}</code> dialog <code>${err.message}</code> appeared.`;
    },

    [TYPE.expectedDialogDoesntAppear]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.nativeDialogError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: The expected system ` +
               `<code>${err.dialog}</code> dialog did not appear.`;
    },

    [TYPE.incorrectSelectActionArguments]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'select action\'s parameters contain an incorrect value.';
    },

    [TYPE.incorrectWaitActionMillisecondsArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'wait action\'s "milliseconds" parameter should be a positive number.';
    },

    [TYPE.incorrectWaitForActionEventArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'waitFor action\'s first parameter should be a function, a CSS selector or an array of CSS selectors.';
    },

    [TYPE.incorrectWaitForActionTimeoutArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'waitFor action\'s "timeout" parameter should be a positive number.';
    },

    [TYPE.waitForActionTimeoutExceeded]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'waitFor action\'s timeout exceeded.';
    },

    [TYPE.emptyIFrameArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'The selector within the inIFrame function returns an empty value.';
    },

    [TYPE.iframeArgumentIsNotIFrame]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'The selector within the inIFrame function doesn’t return an iframe element.';
    },

    [TYPE.multipleIFrameArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'The selector within the inIFrame function returns more than one iframe element.';
    },

    [TYPE.incorrectIFrameArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'The inIFrame function contains an invalid argument.';
    },

    [TYPE.uploadCanNotFindFileToUpload]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'Cannot find the following file(s) to upload:\n\t' +
               `<code>${err.filePaths ? err.filePaths.join(',\n\t') : ''}</code>`;
    },

    [TYPE.uploadElementIsNotFileInput]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'upload action argument does not contain a file input element.';
    },

    [TYPE.uploadInvalidFilePathArgument]: (err) => {
        return `${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error on step ` +
               `<span data-type="step-name">${err.stepName}</span>: ` +
               `<code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>\n` +
               'upload action\'s "path" parameter should be a string or an array of strings.';
    }
};
