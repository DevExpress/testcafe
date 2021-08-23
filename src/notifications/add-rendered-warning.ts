import renderCallsiteSync from '../utils/render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';
import { renderers as renderersRecord } from 'callsite-record';
import WarningLog from './warning-log';
import { CALLSITE_RECORD_CLASS_NAME } from '../test-run/execute-js-expression/constants';
import { renderers as renderersCommand } from '../utils/callsite-command';

export default function addWarning (warningLog: WarningLog, message: string, callsite: any = void 0): void {
    const renderers = callsite?.constructor.name === CALLSITE_RECORD_CLASS_NAME ? renderersRecord : renderersCommand;
    const renderedCallsite = renderCallsiteSync(callsite, {
        renderer:    renderers.noColor,
        stackFilter: createStackFilter(Error.stackTraceLimit),
    });

    warningLog.addWarning(message + `\n\n${renderedCallsite}`);
}
