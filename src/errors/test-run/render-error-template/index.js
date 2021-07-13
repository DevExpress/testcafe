import { TEST_RUN_ERRORS } from '../../types';
import { markup, formatExpressionMessage } from '../utils';
import TEMPLATES from '../templates';
import { renderHtmlWithoutStack, shouldRenderHtmlWithoutStack } from './utils';


function getTestCafeErrorInCustomScriptError (err, viewportWidth) {
    const originErrTemplate  = TEMPLATES[err.originError.code];
    const originErrMessage   = '\n' + err.originError.message;
    let originCallsiteMarkup = '';

    if (shouldRenderHtmlWithoutStack(err)) {
        // HACK: we need to get callsite for custom TestCafe script without real file for it.
        // We use expression as a file content
        originCallsiteMarkup = typeof err.errCallsite === 'string' ? err.errCallsite : renderHtmlWithoutStack(err);
    }

    const originErrorText = originErrTemplate ? originErrTemplate(err.originError, viewportWidth) : originErrMessage +
                                                                                                    '\n';

    return markup(err, `
        An unhandled error occurred in the custom script:
        ${originErrorText}${!originCallsiteMarkup ? `\n${formatExpressionMessage(err.expression, err.line, err.column)}` : ''}
    `, originCallsiteMarkup);
}

export default function renderErrorTemplate (err, viewportWidth) {
    if (err.code === TEST_RUN_ERRORS.uncaughtTestCafeErrorInCustomScript)
        return getTestCafeErrorInCustomScriptError(err, viewportWidth);

    return markup(err, TEMPLATES[err.code](err, viewportWidth));
}
