import EventEmitter from '../../../../../../../shared/utils/event-emitter';
import { ClientReqEmitter } from '../../../../../../../shared/types';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import NetworkApi = ProtocolProxyApi.NetworkApi;
import Protocol from 'devtools-protocol';
import RequestWillBeSentEvent = Protocol.Network.RequestWillBeSentEvent;
import LoadingFinishedEvent = Protocol.Network.LoadingFinishedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;


type ClientReqType = string;
type ClientReqEvtListener = (req: ClientReqType) => void;

const REQ_SEND_EVENT      = 'req-send';
const REQ_COMPLETED_EVENT = 'req-completed';
const REQ_ERROR_EVENT     = 'req-error';

export default class CdpClientReqEmitter extends EventEmitter implements ClientReqEmitter<ClientReqType> {
    private readonly _cdpOffFns: (() => void)[];

    public constructor (Network: NetworkApi, frameId: string) {
        super();

        this._cdpOffFns = [];

        // @ts-ignore
        this._cdpOffFns.push(Network.on('requestWillBeSent', (e: RequestWillBeSentEvent) => {
            if (e.type !== 'Fetch' && e.type !== 'XHR' || (e.frameId || '') !== frameId)
                return;

            this.emit(REQ_SEND_EVENT, e.requestId);
        }));
        // @ts-ignore
        this._cdpOffFns.push(Network.on('loadingFinished', (e: LoadingFinishedEvent) => {
            this.emit(REQ_COMPLETED_EVENT, e.requestId);
        }));
        // @ts-ignore
        this._cdpOffFns.push(Network.on('loadingFailed', (e: LoadingFailedEvent) => {
            this.emit(REQ_ERROR_EVENT, e.requestId);
        }));
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

        for (const cdpOff of this._cdpOffFns)
            cdpOff();
    }
}
