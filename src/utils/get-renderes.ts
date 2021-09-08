import { CALLSITE_RECORD_CLASS_NAME } from '../test-run/execute-js-expression/constants';
import { CallsiteRecord, renderers as renderersRecord } from 'callsite-record';
import { RawCommandCallsiteRecord, renderers as renderersCommand } from './raw-command-callsite-record';

type Renderers = typeof renderersRecord | typeof renderersCommand;

export default function (callsite: CallsiteRecord | RawCommandCallsiteRecord): Renderers {
    return callsite?.constructor.name === CALLSITE_RECORD_CLASS_NAME ? renderersRecord : renderersCommand;
}
