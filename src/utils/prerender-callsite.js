import { renderers } from 'callsite-record';
import renderCallsiteSync from './render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';


export default function prerenderCallsite (callsite) {
    const stackFilter = createStackFilter(Error.stackTraceLimit);

    return {
        prerendered: true,

        default: renderCallsiteSync(callsite, { renderer: renderers.default, stackFilter }),
        html:    renderCallsiteSync(callsite, { renderer: renderers.html, stackFilter }),
        noColor: renderCallsiteSync(callsite, { renderer: renderers.noColor, stackFilter })
    };
}
