import hammerhead from './deps/hammerhead';
import { delay } from './deps/testcafe-core';

var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;

const WAIT_FOR_NEW_SCRIPTS_DELAY = 25;


export default class ScriptExecutionBarrier {
    constructor () {
        this.watchdog = null;

        this.SCRIPT_LOADING_TIMEOUT = 2000;
        this.BARRIER_TIMEOUT        = 3000;

        this.scriptsCount          = 0;
        this.resolveWaitingPromise = null;

        this.scriptElementAddedHandler = e => this._onScriptElementAdded(e.el);

        hammerhead.on(hammerhead.EVENTS.scriptElementAdded, this.scriptElementAddedHandler);
    }

    _onScriptElementAdded (el) {
        var scriptSrc = nativeMethods.scriptSrcGetter.call(el);

        if (scriptSrc === void 0 || scriptSrc === '')
            return;

        this.scriptsCount++;

        var loadingTimeout = null;

        var done = () => {
            nativeMethods.removeEventListener.call(el, 'load', done);
            nativeMethods.removeEventListener.call(el, 'error', done);

            nativeMethods.clearTimeout.call(window, loadingTimeout);

            this._onScriptLoadedOrFailed();
        };

        nativeMethods.addEventListener.call(el, 'load', done);
        nativeMethods.addEventListener.call(el, 'error', done);

        loadingTimeout = nativeMethods.setTimeout.call(window, done, this.SCRIPT_LOADING_TIMEOUT);
    }

    _onScriptLoadedOrFailed () {
        this.scriptsCount--;

        if (this.scriptsCount)
            return;

        delay(WAIT_FOR_NEW_SCRIPTS_DELAY)
            .then(() => {
                if (!this.resolveWaitingPromise)
                    return;

                if (!this.scriptsCount)
                    this.resolveWaitingPromise();
            });
    }

    wait () {
        return new Promise(resolve => {
            var done = () => {
                nativeMethods.clearTimeout.call(window, this.watchdog);
                hammerhead.off(hammerhead.EVENTS.scriptElementAdded, this.scriptElementAddedHandler);

                this.watchdog              = null;
                this.resolveWaitingPromise = null;

                resolve();
            };

            if (!this.scriptsCount)
                done();
            else {
                this.watchdog              = nativeMethods.setTimeout.call(window, () => done(), this.BARRIER_TIMEOUT);
                this.resolveWaitingPromise = () => done();
            }
        });
    }
}
