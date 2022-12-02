import renderCallsiteSync from '../utils/render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import getRenderers from '../utils/get-renderes';
import WarningLog, { WarningLogMessage } from './warning-log';

export default function addWarning (warningLog: WarningLog, msg: WarningLogMessage | string, callsite: any = void 0, ...args: any[]): void {
    const renderers        = getRenderers(callsite);
    const renderedCallsite = renderCallsiteSync(callsite, {
        renderer:    renderers.noColor,
        stackFilter: createStackFilter(Error.stackTraceLimit),
    });

    const isStringMsg = typeof msg === 'string';
    let message       = isStringMsg ? msg.toString() : (msg as WarningLogMessage).message;
    const actionId    = isStringMsg ? null : (msg as WarningLogMessage).actionId;

    message += `\n\n${renderedCallsite}`;

    warningLog.addWarning({ message, actionId }, ...args);
}
