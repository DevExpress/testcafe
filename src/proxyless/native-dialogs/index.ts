import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import { Dictionary } from '../../configuration/interfaces';
import ProxylessApiBase from '../api-base';

export default class NativeDialogsAPI extends ProxylessApiBase {
    private readonly _nativeDialogs: Dictionary<NativeDialogHistoryItem[]>;

    constructor (browserId: string, client: ProtocolApi) {
        super(browserId, client);

        this._nativeDialogs = {};
    }

    public async init (): Promise<void> {
        this._client.Page.on('javascriptDialogOpening', async ({ type, message, url }: Protocol.Page.JavascriptDialogOpeningEvent) => {
            await this._client.Page.handleJavaScriptDialog({ accept: true });

            this._nativeDialogs[this._testRun.id] = this._nativeDialogs[this._testRun.id] || [];

            this._nativeDialogs[this._testRun.id].unshift({
                text: message,
                type,
                url,
            });
        });
    }

    public async getNativeDialogHistory (): Promise<NativeDialogHistoryItem[]> {
        const nativeDialogs = this._nativeDialogs[this._testRun.id] || [];

        return nativeDialogs;
    }

    public async fixMissingBeforeUnloadHandling (): Promise<void> {
        // NOTE: do fake mouse event to make cdp handle the `beforeunload` event.
        // the `beforeunload` event is not handled without this click.
        await this._client.Input.dispatchMouseEvent({
            type:   'mousePressed',
            button: 'left',
            x:      -1,
            y:      -1,
        });
    }
}
