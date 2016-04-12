import Promise from 'pinkie';
import { ClickCommand } from '../test-run/commands';
import getCallsite from '../errors/get-callsite';

export default class TestController {
    constructor (testRun) {
        this.testRun            = testRun;
        this.executionChain     = Promise.resolve();
        this.boundPublicMethods = this._createBoundPublicMethods();
    }

    _createBoundPublicMethods () {
        return Object.keys(TestController.prototype)
            .filter(name => !/^_/.test(name) && typeof TestController.prototype[name] === 'function')
            .reduce((boundMethods, name) => {
                boundMethods[name] = TestController.prototype[name].bind(this);
                return boundMethods;
            }, {});
    }

    _mixinFunctionalityToPromise (promise) {
        Object.keys(this.boundPublicMethods).forEach(name => promise[name] = this.boundPublicMethods[name]);
    }

    _enqueueAction (apiMethodName, CmdCtor, cmdArgs) {
        var callsite = getCallsite(apiMethodName);
        var command  = null;

        try {
            command = new CmdCtor(cmdArgs);
        }
        catch (err) {
            err.callsite = callsite;
            throw err;
        }

        this.executionChain = this.executionChain.then(() => this.testRun.executeCommand(command, callsite));

        this._mixinFunctionalityToPromise(this.executionChain);

        return this.executionChain;
    }

    click (selector, options) {
        return this._enqueueAction('click', ClickCommand, { selector, options });
    }
}


