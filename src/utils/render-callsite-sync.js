import { renderers as renderersRecord } from 'callsite-record';
import { renderers as renderersCommand } from './raw-command-callsite-record';


export default function renderCallsiteSync (callsite, options) {
    if (!callsite)
        return '';

    // NOTE: for raw API callsites
    if (typeof callsite === 'string')
        return callsite;

    if (callsite.prerendered) {
        const renderer = options && options.renderer;

        if (renderer === renderersRecord.html || renderer === renderersCommand.html)
            return callsite.html;

        if (renderer === renderersRecord.noColor || renderer === renderersCommand.noColor)
            return callsite.noColor;

        return callsite.default || '';
    }

    if (!callsite.renderSync)
        return '';

    try {
        // NOTE: Callsite will throw during rendering if it can't find a target file for the specified function or method:
        // https://github.com/inikulin/callsite-record/issues/2#issuecomment-223263941
        return callsite.renderSync(options);
    }
    catch (err) {
        return '';
    }
}
