import { getCallsiteForMethod } from '../../errors/get-callsite';
import { RunCustomActionCommand } from '../../test-run/commands/actions';
import { delegateAPI } from '../../utils/delegated-api';
import { Dictionary } from '../../configuration/interfaces';
import TestController from './index';
import delegatedAPI from './delegated-api';

export default class CustomActions {
    private _testController: TestController;
    private readonly _customActions: Dictionary<Function>;

    constructor (testController: TestController, customActions: Dictionary<Function>) {
        this._testController = testController;
        this._customActions = customActions || {};

        this._registerCustomActions();
    }

    _registerCustomActions (): void {
        Object.entries(this._customActions).forEach(([ name, fn ]) => {
            // @ts-ignore
            this[delegatedAPI(name)] = (...args) => {
                const callsite = getCallsiteForMethod(name) || void 0;

                return this._testController.enqueueCommand(RunCustomActionCommand, { fn, args, name }, this._validateCommand, callsite);
            };
        });

        this._delegateAPI(this._customActions);
    }

    _validateCommand (): boolean {
        return true;
    }

    _delegateAPI (actions: Dictionary<Function>): void {
        const customActionsList = Object.entries(actions).map(([name]) => {
            return {
                srcProp:  delegatedAPI(name),
                apiProp:  name,
                accessor: '',
            };
        });

        delegateAPI(this, customActionsList, { useCurrentCtxAsHandler: true });
    }
}
