import hammerhead from './deps/hammerhead';
import delay from './utils/delay';
import { remove as removeItem, indexOf } from './utils/array';
import { EventEmitter } from './utils/service';

var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;


const REQUESTS_COLLECTION_DELAY              = 300;
const ADDITIONAL_REQUESTS_COLLECTION_DELAY   = 100;
const PAGE_INITIAL_REQUESTS_COLLECTION_DELAY = 50;
const REQUESTS_FINISHED_EVENT                = 'requests-finished';

const GLOBAL_REQUEST_BARRIER_FIELD = 'testcafe|request-barrier';

export default class RequestBarrier extends EventEmitter {
    constructor () {
        super();

        this.BARRIER_TIMEOUT = 3000;

        this.collectingReqs = true;
        this.requests       = [];
        this.watchdog       = null;

        this._unbindHandlers = null;

        this._init();
    }

    _init () {
        var onXhrSend      = e => this._onRequestSend(e.xhr);
        var onXhrCompleted = e => this._onRequestCompleted(e.xhr);
        var onXhrError     = e => this._onRequestError(e.xhr, e.err);
        var onFetchSend    = e => this._onFetchSend(e);

        hammerhead.on(hammerhead.EVENTS.xhrSend, onXhrSend);
        hammerhead.on(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
        hammerhead.on(hammerhead.EVENTS.xhrError, onXhrError);
        hammerhead.on(hammerhead.EVENTS.fetchSend, onFetchSend);

        this._unbindHandlers = () => {
            hammerhead.off(hammerhead.EVENTS.xhrSend, onXhrSend);
            hammerhead.off(hammerhead.EVENTS.xhrCompleted, onXhrCompleted);
            hammerhead.off(hammerhead.EVENTS.xhrError, onXhrError);
            hammerhead.off(hammerhead.EVENTS.fetchSend, onFetchSend);
        };
    }

    _onRequestSend (request) {
        if (this.collectingReqs)
            this.requests.push(request);
    }

    _onRequestCompleted (request) {
        // NOTE: let the last real XHR handler finish its job and try to obtain
        // any additional requests if they were initiated by this handler
        delay(ADDITIONAL_REQUESTS_COLLECTION_DELAY)
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
            delay(isPageLoad ? PAGE_INITIAL_REQUESTS_COLLECTION_DELAY : REQUESTS_COLLECTION_DELAY)
                .then(() => {
                    this.collectingReqs = false;

                    var onRequestsFinished = () => {
                        if (this.watchdog)
                            window.clearTimeout(this.watchdog);

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
