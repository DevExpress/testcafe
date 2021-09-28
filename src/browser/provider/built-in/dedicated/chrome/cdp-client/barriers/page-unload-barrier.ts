import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import PageApi = ProtocolProxyApi.PageApi;
import Protocol from 'devtools-protocol';
import LifecycleEventEvent = Protocol.Page.LifecycleEventEvent;


export default class PageUnloadBarrier {
    private static readonly TIMEOUT = 500;

    private _watchdog: ReturnType<typeof setTimeout> | null;
    private _unloaded: boolean;
    private _waitResolve: (() => void) | null;
    private _offLifecycleEvent: () => void;

    public constructor (Page: PageApi, frameId: string) {
        this._watchdog    = null;
        this._unloaded    = false;
        this._waitResolve = null;

        // @ts-ignore
        this._offLifecycleEvent = Page.on('lifecycleEvent', (e: LifecycleEventEvent) => {
            if (e.name !== 'unload' || (e.frameId || '') !== frameId)
                return;

            this._unloaded = true;

            if (this._waitResolve)
                this._finishWaiting();
        });
    }

    private _finishWaiting (): void {
        if (this._watchdog)
            clearTimeout(this._watchdog);

        this._offLifecycleEvent();
        this._waitResolve!(); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        this._watchdog    = null;
        this._waitResolve = null;
    }

    public wait (): Promise<void> {
        return new Promise((resolve: () => void) => {
            this._waitResolve = resolve;

            if (!this._unloaded) {
                this._finishWaiting();

                return;
            }

            this._watchdog = setTimeout(() => this._finishWaiting(), PageUnloadBarrier.TIMEOUT);
        });
    }
}
