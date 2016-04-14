import Promise from 'pinkie';
import { identity } from 'lodash';
import { ClickCommand } from '../test-run/commands';
import { MissingAwaitError } from '../errors/test-run';
import getCallsite from '../errors/get-callsite';

export default class TestController {
    constructor (testRun) {
        this.testRun              = testRun;
        this.executionChain       = Promise.resolve();
        this.apiMethods           = this._createAPIMethodsList();
        this.callsiteWithoutAwait = null;
    }

    _createAPIMethodsList () {
        return Object
            .keys(TestController.prototype)
            .filter(name => !/^_/.test(name) && typeof TestController.prototype[name] === 'function');
    }


    // NOTE: we track missing `awaits` by exposing a special custom Promise to user code.
    // Action or assertion is awaited if:
    // a)someone used `await` so Promise's `then` function executed
    // b)Promise chained by using one of the mixed-in controller methods
    //
    // In both scenarios, we check that callsite that produced Promise is equal to the one
    // that is currently missing await. This is required to workaround scenarios like this:
    //
    // var t2 = t.click('#btn1'); // <-- stores new callsiteWithoutAwait
    // await t2;                  // <-- callsiteWithoutAwait = null
    // t.click('#btn2');          // <-- stores new callsiteWithoutAwait
    // await t2.click('#btn3');   // <-- without check it will set callsiteWithoutAwait = null, so we will lost tracking
    _createExtendedPromise (promise, callsite) {
        var extendedPromise = promise.then(identity);
        var originalThen    = extendedPromise.then;

        var ensureAwait = () => {
            if (this.callsiteWithoutAwait === callsite)
                this.callsiteWithoutAwait = null;
        };

        extendedPromise.then = function () {
            ensureAwait();
            return originalThen.apply(this, arguments);
        };

        this.apiMethods.forEach(name => {
            var controller = this;

            extendedPromise[name] = function () {
                ensureAwait();
                return controller[`_${name}Impl`].apply(controller, arguments);
            };
        });

        return extendedPromise;
    }

    _enqueueAction (apiMethodName, CmdCtor, cmdArgs) {
        this._checkForMissingAwait();

        var callsite = getCallsite(apiMethodName);
        var command  = null;

        try {
            command = new CmdCtor(cmdArgs);
        }
        catch (err) {
            err.callsite = callsite;
            throw err;
        }

        this.executionChain       = this.executionChain.then(() => this.testRun.executeCommand(command, callsite));
        this.callsiteWithoutAwait = callsite;

        return this._createExtendedPromise(this.executionChain, callsite);
    }

    _checkForMissingAwait () {
        if (this.callsiteWithoutAwait)
            throw new MissingAwaitError(this.callsiteWithoutAwait);
    }

    // API implementation
    // We need implementation methods to obtain correct callsites. If we use plain API
    // methods in chained wrappers then we will have callsite for the wrapped method
    // in this file instead of chained method callsite in user code.
    _clickImpl (selector, options) {
        return this._enqueueAction('click', ClickCommand, { selector, options });
    }

    // API
    click (selector, options) {
        return this._clickImpl(selector, options);
    }
}


