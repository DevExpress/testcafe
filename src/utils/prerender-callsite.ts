import { CallsiteRecord, renderers } from 'callsite-record';
import renderCallsiteSync from './render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import CallsiteCommand from './callsite-command';

export interface RenderedCallsite {
    prerendered: boolean;
    default: string;
    html: string;
    noColor: string;
}

export default function prerenderCallsite (callsite: CallsiteRecord | CallsiteCommand): RenderedCallsite {
    const stackFilter = createStackFilter(Error.stackTraceLimit);

    return {
        prerendered: true,

        default: renderCallsiteSync(callsite, { renderer: renderers.default, stackFilter }),
        html:    renderCallsiteSync(callsite, { renderer: renderers.html, stackFilter }),
        noColor: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter }),
    };
}
