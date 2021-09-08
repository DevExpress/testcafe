import { CallsiteRecord } from 'callsite-record';
import renderCallsiteSync from './render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import { RawCommandCallsiteRecord } from './raw-command-callsite-record';
import getRenderers from './get-renderes';

export interface RenderedCallsite {
    prerendered: boolean;
    default: string;
    html: string;
    noColor: string;
}

export default function prerenderCallsite (callsite: CallsiteRecord | RawCommandCallsiteRecord): RenderedCallsite {
    const stackFilter = createStackFilter(Error.stackTraceLimit);
    const renderers   = getRenderers(callsite);

    return {
        prerendered: true,

        default: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter }),
        html:    renderCallsiteSync(callsite, { renderer: renderers.html, stackFilter }),
        noColor: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter }),
    };
}
