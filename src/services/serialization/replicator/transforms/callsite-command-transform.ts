import prerenderCallsite, { RenderedCallsite } from '../../../../utils/prerender-callsite';
import BaseTransform from './base-transform';
import CallsiteCommand from '../../../../utils/callsite-command';

export default class CallsiteCommandTransform extends BaseTransform {
    public constructor () {
        super('CallsiteCommand');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof CallsiteCommand;
    }

    public toSerializable (callsite: CallsiteCommand): RenderedCallsite {
        return prerenderCallsite(callsite);
    }
}
