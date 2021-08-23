import { CallsiteRecord, renderers as renderersRecord } from 'callsite-record';
import renderCallsiteSync from './render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import { CallsiteCommand, renderers as renderersCommand } from './callsite-command';
import { CALLSITE_RECORD_CLASS_NAME } from '../test-run/execute-js-expression/constants';

export interface RenderedCallsite {
    prerendered: boolean;
    default: string;
    html: string;
    noColor: string;
}

export default function prerenderCallsite (callsite: CallsiteRecord | CallsiteCommand): RenderedCallsite {
    const stackFilter = createStackFilter(Error.stackTraceLimit);
    const renderers = callsite.constructor.name === CALLSITE_RECORD_CLASS_NAME ? renderersRecord : renderersCommand;

    return {
        prerendered: true,

        default: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter }),
        html:    renderCallsiteSync(callsite, { renderer: renderers.html, stackFilter }),
        noColor: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter }),
    };
}
