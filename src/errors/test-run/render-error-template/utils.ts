import { renderers } from 'callsite-record';
import { UncaughtTestCafeErrorInCustomScript } from '../../test-run';
import { shouldSkipCallsite } from '../utils';
import TEMPLATES from '../templates';

export function renderHtmlWithoutStack (err: UncaughtTestCafeErrorInCustomScript): string {
    return err.errCallsite._renderRecord(err.expression, {
        renderer: renderers.html,
        stack:    false,
    });
}

export function shouldRenderHtmlWithoutStack (err: UncaughtTestCafeErrorInCustomScript): boolean {
    return 'errCallsite' in err && TEMPLATES[err.originError.code] && !shouldSkipCallsite(err.originError);
}
