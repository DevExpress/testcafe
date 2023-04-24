import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import NativeAutomationApiBase from '../api-base';
import BindingCalledEvent = Protocol.Runtime.BindingCalledEvent;
import AsyncEventEmitter from '../../utils/async-event-emitter';
import Emittery from 'emittery';
import MessageBus from '../../utils/message-bus';
import { NativeAutomationInitOptions } from '../../shared/types';

const NATIVE_AUTOMATION_STORAGE_BINDING = 'NATIVE_AUTOMATION_STORAGE_BINDING';

export default class SessionStorage extends NativeAutomationApiBase {
    private _eventEmitter: AsyncEventEmitter;

    constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        super(browserId, client, options);

        this._eventEmitter = new AsyncEventEmitter();

        if (this._browserConnection.messageBus)
            this._addTestRunEventListeners(this._browserConnection.messageBus);

        this._browserConnection.on('message-bus-initialized', messageBus => {
            this._addTestRunEventListeners(messageBus);
        });
    }

    private _addTestRunEventListeners (messageBus: MessageBus): void {
        messageBus.on('test-run-done', testRun => {
            this._eventEmitter.emit('contextStorageTestRunDone', { testRunId: testRun.id });
        });
    }

    public on (eventName: string, listener: (eventData?: any) => any): Emittery.UnsubscribeFn {
        return this._eventEmitter.on(eventName, listener);
    }

    public async start (): Promise<void> {
        await this._client.Runtime.addBinding({ name: NATIVE_AUTOMATION_STORAGE_BINDING });

        await this._client.Runtime.on('bindingCalled', (event: BindingCalledEvent) => {
            if (event.name === NATIVE_AUTOMATION_STORAGE_BINDING) {
                const { testRunId, frameDriverId, data } = JSON.parse(event.payload);

                this._eventEmitter.emit('contextStorageSync', { sessionStorage: data, testRunId, frameDriverId });
            }
        });
    }
}
