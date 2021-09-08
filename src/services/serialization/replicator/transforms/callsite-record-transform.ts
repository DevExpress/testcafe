import { CallsiteRecord } from 'callsite-record';
import prerenderCallsite, { RenderedCallsite } from '../../../../utils/prerender-callsite';
import BaseTransform from './base-transform';
import { ERROR_FILENAME, CALLSITE_RECORD_CLASS_NAME } from '../../../../test-run/execute-js-expression/constants';

interface CallsiteRecordLike {
    filename: string;
}

export default class CallsiteRecordTransform extends BaseTransform {
    public constructor () {
        super(CALLSITE_RECORD_CLASS_NAME);
    }

    public shouldTransform (_: unknown, val: CallsiteRecordLike): boolean {
        return !!val &&
            (!!val.constructor && val.constructor.name === CALLSITE_RECORD_CLASS_NAME) &&
            (!!val.filename && val.filename !== ERROR_FILENAME); // Don't serialize callsites for RAW API)
    }

    public toSerializable (callsite: CallsiteRecord): RenderedCallsite {
        return prerenderCallsite(callsite);
    }
}
