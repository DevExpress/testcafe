import hammerhead from './deps/hammerhead';
import delay from './utils/delay';
import { remove as removeItem, indexOf } from './utils/array';
import { EventEmitter } from './utils/service';

var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;


const REQUESTS_COLLECTION_DELAY_DEFAULT = 50;
const REQUESTS_FINISHED_EVENT           = 'requests-finished';

const GLOBAL_REQUEST_BARRIER_FIELD = 'testcafe|request-barrier';

export default class RequestBarrier extends EventEmitter {
    constructor (delays = {}) {
        super();

        this.BARRIER_TIMEOUT = 3000;

        this.delays = {
            requestsCollection: delays.requestsCollection === void 0 ?
                REQUESTS_COLLECTION_DELAY_DEFAULT : delays.requestsCollection,

            additionalRequestsCollection: delays.additionalRequestsCollection === void 0 ?
                REQUESTS_COLLECTION_DELAY_DEFAULT : delays.additionalRequestsCollection,

            pageInitialRequestsCollection: delays.pageInitialRequestsCollection === void 0 ?
                REQUESTS_COLLECTION_DELAY_DEFAULT : delays.pageInitialRequestsCollection
        };

        this.collectingReqs = true;
        this.requests       = [];
        this.watchdog       = null;

        this._unbindHandlers = null;

        this._init();
    }

    _init () {
        var onXhrSend      = e => this._onXhrSend(e.xhr);
        var onXhrCompleted = e => this._onRequestCompleted(e.xhr);
        var onXhrError     = e => this._onRequestError(e.xhr, e.err);
        var onFetchSend    = e => this._onFetchSend(e);

        hammerhead.on(hammerhead.EVENTS.beforeXhrSend, onXhrSend);
        hammerhead.on(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
        hammerhead.on(hammerhead.EVENTS.xhrError, onXhrError);
        hammerhead.on(hammerhead.EVENTS.fetchSent, onFetchSend);

        this._unbindHandlers = () => {
            hammerhead.off(hammerhead.EVENTS.beforeXhrSend, onXhrSend);
            hammerhead.off(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
            hammerhead.off(hammerhead.EVENTS.xhrError, onXhrError);
            hammerhead.off(hammerhead.EVENTS.fetchSent, onFetchSend);
        };
    }

    _onXhrSend (request) {
        if (this.collectingReqs)
            this.requests.push(request);
    }

    _onRequestCompleted (request) {
        // NOTE: let the last real XHR handler finish its job and try to obtain
        // any additional requests if they were initiated by this handler
        delay(this.delays.additionalRequestsCollection)
            .then(() => this._onRequestFinished(request));
    }

    _onRequestError (request) {
        this._onRequestFinished(request);
    }

    _onRequestFinished (request) {
        if (indexOf(this.requests, request) > -1) {
            removeItem(this.requests, request);

            if (!this.collectingReqs && !this.requests.length)
                this.emit(REQUESTS_FINISHED_EVENT);
        }
    }

    _onFetchSend (request) {
        if (this.collectingReqs) {
            this.requests.push(request);

            request
                .then(() => this._onRequestCompleted(request))
                .catch(() => this._onRequestError(request));
        }
    }

    wait (isPageLoad) {
        return new Promise(resolve => {
            delay(isPageLoad ? this.delays.pageInitialRequestsCollection : this.delays.requestsCollection)
                .then(() => {
                    this.collectingReqs = false;

                    var onRequestsFinished = () => {
                        if (this.watchdog)
                            nativeMethods.clearTimeout.call(window, this.watchdog);

                        this._unbindHandlers();
                        resolve();
                    };

                    if (this.requests.length) {
                        this.watchdog = nativeMethods.setTimeout.call(window, onRequestsFinished, this.BARRIER_TIMEOUT);
                        this.on(REQUESTS_FINISHED_EVENT, onRequestsFinished);
                    }
                    else
                        onRequestsFinished();
                });
        });
    }
}

RequestBarrier.GLOBAL_REQUEST_BARRIER_FIELD = GLOBAL_REQUEST_BARRIER_FIELD;

window[RequestBarrier.GLOBAL_REQUEST_BARRIER_FIELD] = RequestBarrier;
