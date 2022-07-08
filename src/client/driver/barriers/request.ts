import delay from '../../core/utils/delay';
import { NativeMethods, ClientRequestEmitter } from '../../../shared/types';
// @ts-ignore
import { nativeMethods, Promise } from '../deps/hammerhead';


interface Delays {
    requestsCollection: number;
    additionalRequestsCollection: number;
    pageInitialRequestsCollection: number;
}

const REQUESTS_COLLECTION_DELAY_DEFAULT = 50;

export default class RequestBarrier<R> {
    private static readonly TIMEOUT = 3000;

    private readonly _delays: Delays;
    private readonly _requests: Set<R>;
    private readonly _emitter: ClientRequestEmitter<R>;
    private _waitResolve: (() => void) | null;
    private _watchdog: ReturnType<NativeMethods['setTimeout']> | null;
    protected _collectingReqs: boolean;

    public constructor (emitter: ClientRequestEmitter<R>, delays: Partial<Delays> = {}) {
        this._delays = {
            requestsCollection:            delays.requestsCollection ?? REQUESTS_COLLECTION_DELAY_DEFAULT,
            additionalRequestsCollection:  delays.additionalRequestsCollection ?? REQUESTS_COLLECTION_DELAY_DEFAULT,
            pageInitialRequestsCollection: delays.pageInitialRequestsCollection ?? REQUESTS_COLLECTION_DELAY_DEFAULT,
        };

        this._emitter        = emitter;
        this._waitResolve    = null;
        this._watchdog       = null;
        this._requests       = new Set();
        this._collectingReqs = true;

        this._startListening();
    }

    private _startListening (): void {
        this._emitter.onRequestSend((req: R) => this._onRequestSend(req));
        this._emitter.onRequestCompleted((req: R) => this._onRequestCompleted(req));
        this._emitter.onRequestError((req: R) => this._onRequestError(req));
    }

    private _offListening (): void {
        this._emitter.offAll();
    }

    private _onRequestSend (req: R): void {
        if (this._collectingReqs)
            this._requests.add(req);
    }

    private _onRequestCompleted (req: R): void {
        // NOTE: let the last real XHR handler finish its job and try to obtain
        // any additional requests if they were initiated by this handler
        delay(this._delays.additionalRequestsCollection)
            .then(() => this._onRequestFinished(req));
    }

    private _onRequestFinished (req: R): void {
        if (!this._requests.has(req))
            return;

        this._requests.delete(req);

        if (!this._collectingReqs && !this._requests.size && this._watchdog)
            this._finishWaiting();
    }

    private _onRequestError (req: R): void {
        this._onRequestFinished(req);
    }

    private _finishWaiting (): void {
        if (this._watchdog) {
            const clearTimeout = nativeMethods.clearTimeout;

            clearTimeout(this._watchdog);

            this._watchdog = null;
        }

        this._requests.clear();
        this._offListening();
        this._waitResolve!(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public wait (isPageLoad?: boolean): Promise<void> {
        return delay(isPageLoad ? this._delays.pageInitialRequestsCollection : this._delays.requestsCollection)
            .then(() => new Promise((resolve: () => void) => {
                this._collectingReqs = false;
                this._waitResolve    = resolve;

                if (!this._requests.size) {
                    this._finishWaiting();

                    return;
                }

                const setTimeout = nativeMethods.setTimeout;

                this._watchdog = setTimeout(() => this._finishWaiting(), RequestBarrier.TIMEOUT);
            }));
    }
}
