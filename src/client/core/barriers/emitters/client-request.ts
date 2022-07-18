import hammerhead from '../../deps/hammerhead';
import EventEmitter from '../../utils/event-emitter';
import { ClientRequestEmitter } from '../../../../shared/types';


interface XhrEvent { xhr: XMLHttpRequest }
type ClientRequestType = XMLHttpRequest | Promise<Response>;
type ClientRequestEventListener = (req: ClientRequestType) => void;

const REQUEST_SEND_EVENT      = 'request-send';
const REQUEST_COMPLETED_EVENT = 'request-completed';
const REQUEST_ERROR_EVENT     = 'request-error';

export default class HammerheadClientRequestEmitter extends EventEmitter implements ClientRequestEmitter<ClientRequestType> {
    private readonly _hammerheadListenersInfo: { evt: string; listener: (...args: any[]) => void }[];

    public constructor () {
        super();

        this._hammerheadListenersInfo = [];
        this._addHammerheadListener(hammerhead.EVENTS.beforeXhrSend, ({ xhr }: XhrEvent) => this.emit(REQUEST_SEND_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.xhrCompleted, ({ xhr }: XhrEvent) => this.emit(REQUEST_COMPLETED_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.xhrError, ({ xhr }: XhrEvent) => this.emit(REQUEST_ERROR_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.fetchSent, (fetch: Promise<Response>) => {
            this.emit(REQUEST_SEND_EVENT, fetch);

            fetch.then(() => this.emit(REQUEST_COMPLETED_EVENT, fetch), () => this.emit(REQUEST_ERROR_EVENT, fetch));
        });
    }

    private _addHammerheadListener (evt: string, listener: (...args: any[]) => void): void {
        hammerhead.on(evt, listener);
        this._hammerheadListenersInfo.push({ evt, listener });
    }

    public onRequestSend (listener: ClientRequestEventListener): void {
        this.on(REQUEST_SEND_EVENT, listener);
    }

    public onRequestCompleted (listener: ClientRequestEventListener): void {
        this.on(REQUEST_COMPLETED_EVENT, listener);
    }

    public onRequestError (listener: ClientRequestEventListener): void {
        this.on(REQUEST_ERROR_EVENT, listener);
    }

    public offAll (): void {
        super.offAll();

        for (const info of this._hammerheadListenersInfo)
            hammerhead.off.call(hammerhead, info.evt, info.listener);
    }
}
