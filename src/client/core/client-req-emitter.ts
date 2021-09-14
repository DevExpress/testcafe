import hammerhead from './deps/hammerhead';
import EventEmitter from '../../shared/utils/event-emitter';
import { ClientReqEmitter } from '../../shared/types';


interface XhrEvent {
    xhr: XMLHttpRequest;
}

type ClientReqType = XMLHttpRequest | Promise<Response>;
type ClientReqEvtListener = (req: ClientReqType) => void;

const REQ_SEND_EVENT      = 'req-send';
const REQ_COMPLETED_EVENT = 'req-completed';
const REQ_ERROR_EVENT     = 'req-error';

export default class HhClientReqEmitter extends EventEmitter implements ClientReqEmitter<ClientReqType> {
    private readonly _hhListenersInfo: { evt: string; listener: (...args: any[]) => void }[];

    public constructor () {
        super();

        this._hhListenersInfo = [];
        this._addHammerheadListener(hammerhead.EVENTS.beforeXhrSend, ({ xhr }: XhrEvent) => this.emit(REQ_SEND_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.xhrCompleted, ({ xhr }: XhrEvent) => this.emit(REQ_COMPLETED_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.xhrError, ({ xhr }: XhrEvent) => this.emit(REQ_ERROR_EVENT, xhr));
        this._addHammerheadListener(hammerhead.EVENTS.fetchSent, (fetch: Promise<Response>) => {
            this.emit(REQ_SEND_EVENT, fetch);

            fetch.then(() => this.emit(REQ_COMPLETED_EVENT, fetch), () => this.emit(REQ_ERROR_EVENT, fetch));
        });
    }

    private _addHammerheadListener (evt: string, listener: (...args: any[]) => void): void {
        hammerhead.on(evt, listener);
        this._hhListenersInfo.push({ evt, listener });
    }

    public onReqSend (listener: ClientReqEvtListener): void {
        this.on(REQ_SEND_EVENT, listener);
    }

    public onReqCompleted (listener: ClientReqEvtListener): void {
        this.on(REQ_COMPLETED_EVENT, listener);
    }

    public onReqError (listener: ClientReqEvtListener): void {
        this.on(REQ_ERROR_EVENT, listener);
    }

    public offAll (): void {
        super.offAll();

        for (const info of this._hhListenersInfo)
            hammerhead.off.call(hammerhead, info.evt, info.listener);
    }
}
