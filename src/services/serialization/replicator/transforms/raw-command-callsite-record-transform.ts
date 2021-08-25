import prerenderCallsite, { RenderedCallsite } from '../../../../utils/prerender-callsite';
import BaseTransform from './base-transform';
import { RawCommandCallsiteRecord } from '../../../../utils/raw-command-callsite-record';

export default class RawCommandCallsiteRecordTransform extends BaseTransform {
    public constructor () {
        super('RawCommandCallsiteRecord');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof RawCommandCallsiteRecord;
    }

    public toSerializable (callsite: RawCommandCallsiteRecord): RenderedCallsite {
        return prerenderCallsite(callsite);
    }
}
