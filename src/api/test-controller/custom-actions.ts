import TestRun from '../../test-run';
import { getCallsiteForMethod } from '../../errors/get-callsite';
import { RunCustomActionCommand } from '../../test-run/commands/actions';
import { delegateAPI } from '../../utils/delegated-api';

function delegatedAPI (methodName: string, accessor = ''): string {
    return `_${methodName}$${accessor}`;
}

export default class CustomActions {
    private readonly _testRun: TestRun;

    constructor (testRun: TestRun) {
        this._testRun = testRun;
        this._registerCustomActions();
    }

    _registerCustomActions (): void {
        // @ts-ignore
        const customActions = this._testRun?.opts?.customActions || {};

        Object.entries(customActions).forEach(([ name, fn ]) => {
            // @ts-ignore
            CustomActions.prototype[delegatedAPI(name)] = (...args) => {
                const callsite = getCallsiteForMethod(name);

                // @ts-ignore
                return this._testRun.controller._enqueueCommand(RunCustomActionCommand, { fn, args }, null, callsite);
            };
        });

        this._extendTestControllerAPIList(customActions);
    }

    // @ts-ignore
    _extendTestControllerAPIList (actions): void {
        const customActionsList = Object.entries(actions).map(([name]) => {
            return {
                srcProp:  delegatedAPI(name),
                apiProp:  name,
                accessor: '',
            };
        });

        // @ts-ignore
        CustomActions.API_LIST = customActionsList;

        // @ts-ignore
        delegateAPI(CustomActions.prototype, CustomActions.API_LIST, { useCurrentCtxAsHandler: true });
    }
}
