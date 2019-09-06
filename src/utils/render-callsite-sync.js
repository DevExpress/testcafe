export default function renderCallsiteSync (callsite, options) {
    try {
        // NOTE: Callsite will throw during rendering if it can't find a target file for the specified function or method:
        // https://github.com/inikulin/callsite-record/issues/2#issuecomment-223263941
        return callsite.renderSync(options);
    }
    catch (err) {
        return '';
    }
}
