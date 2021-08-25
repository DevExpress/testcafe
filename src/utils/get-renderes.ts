import { CALLSITE_RECORD_CLASS_NAME } from '../test-run/execute-js-expression/constants';
import { CallsiteRecord, renderers as renderersRecord } from 'callsite-record';
import { CallsiteCommand, renderers as renderersCommand } from './callsite-command';

type Renderers = typeof renderersRecord | typeof renderersCommand;

export default function (callsite: CallsiteRecord | CallsiteCommand): Renderers {
    return callsite?.constructor.name === CALLSITE_RECORD_CLASS_NAME ? renderersRecord : renderersCommand;
}
