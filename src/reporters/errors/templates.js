import dedent from 'dedent';
import CATEGORY from './category';
import TYPE from './type';
import buildDiff from './assertion-diffs';

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
        return `Arrays differ at index <code>${err.key}</code>:`;

    if (err.isObjects)
        return `Objects differ at the <code>${err.key}</code> field:`;

    if (err.isStrings)
        return `Strings differ at index <code>${err.key}</code>:`;

    return '';
}

export default {
    [TYPE.okAssertion]: (err) => {
        return dedent`
            ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <strong>Expected: </strong>not <code>null</code>, not <code>undefined</code>, not <code>false</code>, not <code>NaN</code> and not <code>''</code>
            <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
        `;
    },

    [TYPE.notOkAssertion]: (err) => {
        return dedent`
            ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <strong>Expected: </strong><code>null</code>, <code>undefined</code>, <code>false</code>, <code>NaN</code> or <code>''</code>
            <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
        `;
    },

    [TYPE.eqAssertion]: (err, maxStringLength) => {
        var diff          = buildDiff(err, maxStringLength);
        var diffMarkerStr = diff.marker ? `          ${diff.marker}` : '';

        return dedent`
            ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            ${getDiffHeader(err)}

            <strong>Expected: </strong><code>${escapeNewLines(diff.expected)}</code>
            <strong>Actual:   </strong><code>${escapeNewLines(diff.actual)}</code>
            <code>${diffMarkerStr}</code>
        `;
    },

    [TYPE.notEqAssertion]: (err) => {
        return dedent`
            ${getAssertionMsgPrefix(err)} failed at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <strong>Expected: </strong>not <code>${escapeNewLines(err.actual)}</code>
            <strong>Actual:   </strong><code>${escapeNewLines(err.actual)}</code>
        `;
    },

    [TYPE.xhrRequestTimeout]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>XMLHttpRequest timed out.
        `;
    },

    [TYPE.iframeLoadingTimeout]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>IFrame loading timed out.
        `;
    },

    [TYPE.inIFrameTargetLoadingTimeout]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.timeout}</span>Error at step <span data-type="step-name">${err.stepName}</span>:
            IFrame target loading timed out.
        `;
    },

    [TYPE.urlUtilProtocolIsNotSupported]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Failed to process the <a href="${err.destUrl}">${err.destUrl}</a> resource. TestCafe supports only HTTP and HTTPS protocols.
        `;
    },

    [TYPE.uncaughtJSError]: (err) => {
        if (err.pageUrl) {
            return dedent`
                ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Uncaught JavaScript error <code>${err.scriptErr}</code> on page <a href="${err.pageUrl}">${err.pageUrl}</a>
            `;
        }

        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Uncaught JavaScript error <code>${err.scriptErr}</code> on page.
        `;
    },

    [TYPE.uncaughtJSErrorInTestCodeStep]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Error at step <span data-type="step-name">${err.stepName}</span>:
            Uncaught JavaScript error in test code - <code>${err.scriptErr}</code>.
        `;
    },

    [TYPE.storeDomNodeOrJqueryObject]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.unhandledException}</span>Error at step <span data-type="step-name">${err.stepName}</span>:
            It is not allowed to share the DOM element, jQuery object or a function between test steps via "this" object.
        `;
    },

    [TYPE.emptyFirstArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            A target element of the <code data-type="api">${err.action}</code> action has not been found in the DOM tree.
            If this element should be created after animation or a time-consuming operation is finished, use the <code data-type="api">waitFor</code> action (available for use in code) to pause test execution until this element appears.
        `;
    },

    [TYPE.invisibleActionElement]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            A target element <code>${err.element}</code> of the <code data-type="api">${err.action}</code> action is not visible.
            If this element should appear when you are hovering over another element, make sure that you properly recorded the <code data-type="api">hover</code> action.
        `;

    },

    [TYPE.incorrectDraggingSecondArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">drag</code> action drop target is incorrect.
        `;
    },

    [TYPE.incorrectPressActionArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">press</code> action parameter contains incorrect key code.
        `;
    },

    [TYPE.emptyTypeActionArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            The <code data-type="api">type<code> action's parameter text is empty.
        `;
    },

    [TYPE.unexpectedDialog]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.nativeDialogError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:
            Unexpected system <code>${err.dialog}</code> dialog <code>${err.message}</code> appeared.
        `;
    },

    [TYPE.expectedDialogDoesntAppear]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.nativeDialogError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:
            The expected system <code>${err.dialog}</code> dialog did not appear.
        `;
    },

    [TYPE.incorrectSelectActionArguments]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">select</code> action's parameters contain an incorrect value.
        `;
    },

    [TYPE.incorrectWaitActionMillisecondsArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">wait</code> action's "milliseconds" parameter should be a positive number.
        `;
    },

    [TYPE.incorrectWaitForActionEventArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">waitFor</code> action's first parameter should be a function, a CSS selector or an array of CSS selectors.
        `;
    },

    [TYPE.incorrectWaitForActionTimeoutArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">waitFor</code> action's "timeout" parameter should be a positive number.
        `;
    },

    [TYPE.waitForActionTimeoutExceeded]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">waitFor</code> action's timeout exceeded.
        `;
    },

    [TYPE.emptyIFrameArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            The selector within the <code data-type="api">inIFrame</code> function returns an empty value.
        `;
    },

    [TYPE.iframeArgumentIsNotIFrame]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            The selector within the <code data-type="api">inIFrame</code> function doesn’t return an iframe element.
        `;
    },

    [TYPE.multipleIFrameArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            The selector within the <code data-type="api">inIFrame</code> function returns more than one iframe element.
        `;
    },

    [TYPE.incorrectIFrameArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            The <code data-type="api">inIFrame</code> function contains an invalid argument.
        `;
    },

    [TYPE.uploadCanNotFindFileToUpload]: (err) => {
        var msg = dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            Cannot find the following file(s) to upload:
        `;

        return msg + err.filePaths.map(path => `\n    <code>${path}</code>`).join(',');
    },

    [TYPE.uploadElementIsNotFileInput]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">upload</code> action argument does not contain a file input element.
        `;
    },

    [TYPE.uploadInvalidFilePathArgument]: (err) => {
        return dedent`
            ${getMsgPrefix(err)}<span data-type="category">${CATEGORY.actionError}</span>Error at step <span data-type="step-name">${err.stepName}</span>:

                <code data-type="step-source">${escapeNewLines(err.relatedSourceCode)}</code>

            <code data-type="api">upload</code> action's "path" parameter should be a string or an array of strings.
        `;
    }
};
