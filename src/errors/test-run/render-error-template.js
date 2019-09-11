import { escape as escapeHtml } from 'lodash';
import { renderers } from 'callsite-record';
import { TEST_RUN_ERRORS } from '../types';
import { markup, shouldSkipCallsite } from './utils';
import TEMPLATES from './templates';

function getTestCafeErrorInCustomScriptError (err, viewportWidth) {
    let originCallsiteMarkup = '';

    if (err.errCallsite && !shouldSkipCallsite(err.originError)) {
        // HACK: we need to get callsite for custom TestCafe script without real file for it.
        // We use expression as a file content.
        originCallsiteMarkup = err.errCallsite._renderRecord(err.errCallsite.filename, {
            renderer: renderers.html,
            stack:    false
        });
    }

    const originErrorText = TEMPLATES[err.originError.code](err.originError, viewportWidth);

    return markup(err, `
        An unhandled error occurred in the TestCafe script:
        ${originErrorText}${!originCallsiteMarkup ? `\n${escapeHtml(err.expression)}` : ''}
    `, originCallsiteMarkup);
}

export default function renderErrorTemplate (err, viewportWidth) {
    if (err.code === TEST_RUN_ERRORS.uncaughtTestCafeErrorInCustomScript)
        return getTestCafeErrorInCustomScriptError(err, viewportWidth);

    return markup(err, TEMPLATES[err.code](err, viewportWidth));
}

