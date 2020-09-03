import renderCallsiteSync from '../utils/render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import { renderers } from 'callsite-record';
import WarningLog from './warning-log';

export default function addWarning (warningLog: WarningLog, message: string, callsite: any = void 0): void {
    const renderedCallsite = renderCallsiteSync(callsite, {
        renderer:    renderers.noColor,
        stackFilter: createStackFilter(Error.stackTraceLimit)
    });

    warningLog.addWarning(message + `\n\n${renderedCallsite}`);
}
