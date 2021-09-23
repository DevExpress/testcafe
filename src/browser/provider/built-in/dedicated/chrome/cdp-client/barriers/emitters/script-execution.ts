import EventEmitter from '../../../../../../../../shared/utils/event-emitter';
import { ScriptExecutionEmitter } from '../../../../../../../../shared/types';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import NetworkApi = ProtocolProxyApi.NetworkApi;
import Protocol from 'devtools-protocol';
import RequestWillBeSentEvent = Protocol.Network.RequestWillBeSentEvent;
import LoadingFinishedEvent = Protocol.Network.LoadingFinishedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;


type ScriptEventListener = (script: string) => void;

const SCRIPT_ADDED            = 'script-added';
const SCRIPT_LOADED_OR_FAILED = 'script-loaded-or-failed';

export default class CdpScriptExecutionEmitter extends EventEmitter implements ScriptExecutionEmitter<string> {
    private readonly _cdpOffFunctions: (() => void)[];

    public constructor (Network: NetworkApi, frameId: string) {
        super();

        this._cdpOffFunctions = [];

        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('requestWillBeSent', (e: RequestWillBeSentEvent) => {
            if (e.type !== 'Script' || (e.frameId || '') !== frameId)
                return;

            this.emit(SCRIPT_ADDED, e.requestId);
        }));

        const completeListener = (e: LoadingFinishedEvent | LoadingFailedEvent): void => this.emit(SCRIPT_LOADED_OR_FAILED, e.requestId);

        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('loadingFinished', completeListener));
        // @ts-ignore
        this._cdpOffFunctions.push(Network.on('loadingFailed', completeListener));
    }

    public onScriptAdded (listener: ScriptEventListener): void {
        this.on(SCRIPT_ADDED, listener);
    }

    public onScriptLoadedOrFailed (listener: ScriptEventListener): void {
        this.on(SCRIPT_LOADED_OR_FAILED, listener);
    }

    public offAll (): void {
        super.offAll();

        for (const cdpOff of this._cdpOffFunctions)
            cdpOff();
    }
}
