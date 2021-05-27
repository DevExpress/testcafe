import {
    ExecuteClientFunctionCommand,
    ExecuteSelectorCommand
} from '../../../../test-run/commands/observation';

import CommandType from '../../../../test-run/commands/type';

interface SerializableExecuteClientFunctionCommandBaseTransform {
    type: string;
    instantiationCallsiteName: string;
    fnCode: string;
    args: string[];
    dependencies: string[];
    needError?: boolean;
    apiFnChain?: string[];
    visibilityCheck?: boolean;
    timeout?: number;
}

export default class ExecuteClientFunctionCommandBaseTransform {
    public readonly type: string;

    public constructor () {
        this.type = 'ExecuteClientFunctionCommandBase';
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof ExecuteClientFunctionCommand ||
            val instanceof ExecuteSelectorCommand;
    }

    public toSerializable (value: unknown): SerializableExecuteClientFunctionCommandBaseTransform {
        const {
            type,
            instantiationCallsiteName,
            fnCode,
            args,
            dependencies,
            needError,
            apiFnChain,
            visibilityCheck,
            timeout
        } = value as SerializableExecuteClientFunctionCommandBaseTransform;

        return {
            type,
            instantiationCallsiteName,
            fnCode,
            args,
            dependencies,
            needError,
            apiFnChain,
            visibilityCheck,
            timeout
        };
    }

    public fromSerializable (value: SerializableExecuteClientFunctionCommandBaseTransform): ExecuteClientFunctionCommand | ExecuteSelectorCommand {
        return value.type === CommandType.executeClientFunction ?
            new ExecuteClientFunctionCommand(value) :
            new ExecuteSelectorCommand(value);
    }
}
