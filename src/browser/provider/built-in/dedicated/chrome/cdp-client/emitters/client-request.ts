import EventEmitter from '../../../../../../../shared/utils/event-emitter';
import { ClientRequestEmitter } from '../../../../../../../shared/types';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import NetworkApi = ProtocolProxyApi.NetworkApi;
import Protocol from 'devtools-protocol';
import RequestWillBeSentEvent = Protocol.Network.RequestWillBeSentEvent;
import LoadingFinishedEvent = Protocol.Network.LoadingFinishedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;


type ClientRequestType = string;
type ClientRequestEventListener = (req: ClientRequestType) => void;

const REQUEST_SEND_EVENT      = 'request-send';
const REQUEST_COMPLETED_EVENT = 'request-completed';
const REQUEST_ERROR_EVENT     = 'request-error';

export default class CdpClientRequestEmitter extends EventEmitter implements ClientRequestEmitter<ClientRequestType> {
    private readonly _cdpOffFunctions: (() => void)[];

    public constructor (Network: NetworkApi, frameId: string) {
        super();

        this._cdpOffFunctions = [];

        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('requestWillBeSent', (e: RequestWillBeSentEvent) => {
            if (e.type !== 'Fetch' && e.type !== 'XHR' || (e.frameId || '') !== frameId)
                return;

            this.emit(REQUEST_SEND_EVENT, e.requestId);
        }));
        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('loadingFinished', (e: LoadingFinishedEvent) => {
            this.emit(REQUEST_COMPLETED_EVENT, e.requestId);
        }));
        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('loadingFailed', (e: LoadingFailedEvent) => {
            this.emit(REQUEST_ERROR_EVENT, e.requestId);
        }));
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

        for (const cdpOff of this._cdpOffFunctions)
            cdpOff();
    }
}
