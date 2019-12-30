import hammerhead from './deps/hammerhead';
import { delay } from './deps/testcafe-core';

const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;
const browserUtils  = hammerhead.utils.browser;

const WAIT_FOR_NEW_SCRIPTS_DELAY = 25;

const nativeAddEventListener    = browserUtils.isIE11
    ? nativeMethods.addEventListener
    : nativeMethods.eventTargetAddEventListener;
const nativeRemoveEventListener = browserUtils.isIE11
    ? nativeMethods.removeEventListener
    : nativeMethods.eventTargetRemoveEventListener;


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
        const scriptSrc = nativeMethods.scriptSrcGetter.call(el);

        if (scriptSrc === void 0 || scriptSrc === '')
            return;

        this.scriptsCount++;

        let loadingTimeout = null;

        const done = () => {
            nativeRemoveEventListener.call(el, 'load', done);
            nativeRemoveEventListener.call(el, 'error', done);

            nativeMethods.clearTimeout.call(window, loadingTimeout);

            this._onScriptLoadedOrFailed();
        };

        nativeAddEventListener.call(el, 'load', done);
        nativeAddEventListener.call(el, 'error', done);

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
            const done = () => {
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
