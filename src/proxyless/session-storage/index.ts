import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import ProxylessApiBase from '../api-base';
import BindingCalledEvent = Protocol.Runtime.BindingCalledEvent;
import AsyncEventEmitter from '../../utils/async-event-emitter';
import Emittery from 'emittery';

const PROXYLESS_STORAGE_BINDING = 'PROXYLESS_STORAGE_BINDING';

export default class SessionStorage extends ProxylessApiBase {
    public sessionStorage: string;
    private _eventEmitter: AsyncEventEmitter;

    constructor (browserId: string, client: ProtocolApi) {
        super(browserId, client);

        this.sessionStorage = '';
        this._eventEmitter = new AsyncEventEmitter();
    }

    public on (eventName: string, listener: (eventData?: any) => any): Emittery.UnsubscribeFn {
        return this._eventEmitter.on(eventName, listener);
    }

    public async init (): Promise<void> {
        await this._client.Runtime.addBinding({ name: PROXYLESS_STORAGE_BINDING });

        await this._client.Runtime.on('bindingCalled', (event: BindingCalledEvent) => {
            if (event.name === 'PROXYLESS_STORAGE_BINDING') {
                this.sessionStorage = event.payload;

                this._eventEmitter.emit('contextStorageModified', this.sessionStorage);
            }
        });
    }
}
