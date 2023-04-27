import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import NativeAutomationApiBase from '../api-base';
import BindingCalledEvent = Protocol.Runtime.BindingCalledEvent;
import MessageBus from '../../utils/message-bus';
import { NativeAutomationInitOptions } from '../../shared/types';
import TestRun from '../../test-run';
import { sessionStorageLogger } from '../../utils/debug-loggers';

const NATIVE_AUTOMATION_STORAGE_BINDING = 'NATIVE_AUTOMATION_STORAGE_BINDING';

export default class SessionStorage extends NativeAutomationApiBase {
    constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        super(browserId, client, options);
    }

    private async _onTestRunDoneHandler (testRun: TestRun): Promise<void> {
        await this.emit('contextStorageTestRunDone', { testRunId: testRun.id });

        sessionStorageLogger('contextStorageTestRunDone', testRun.id);
    }

    private _addTestRunEventListeners (messageBus: MessageBus): void {
        messageBus.on('test-run-done', this._onTestRunDoneHandler.bind(this));
    }

    private _addEventListeners (): void {
        if (this._browserConnection.messageBus)
            this._addTestRunEventListeners(this._browserConnection.messageBus);

        this._browserConnection.on('message-bus-initialized', messageBus => {
            this._addTestRunEventListeners(messageBus);
        });
    }

    public removeEventListeners (): void {
        if (this._browserConnection.messageBus)
            this._browserConnection.messageBus.off('test-run-done', this._onTestRunDoneHandler);
    }

    protected async _addCDPEventListeners (): Promise<void> {
        await this._client.Runtime.on('bindingCalled', (event: BindingCalledEvent) => {
            if (this._stopped)
                return;

            sessionStorageLogger('bindingCalled', event.name, event.payload);

            if (event.name === NATIVE_AUTOMATION_STORAGE_BINDING) {
                const { testRunId, frameDriverId, data } = JSON.parse(event.payload);

                this.emit('contextStorageSync', { sessionStorage: data, testRunId, frameDriverId });
            }
        });
    }

    public async start (): Promise<void> {
        await super.start();

        this._addEventListeners();

        await this._client.Runtime.addBinding({ name: NATIVE_AUTOMATION_STORAGE_BINDING });

        sessionStorageLogger('start');
    }

    public async stop (): Promise<void> {
        await super.stop();

        this.removeEventListeners();

        // NOTE: It looks like this function works incorrectly.
        // However, I leave it here for the future investigation.
        await this._client.Runtime.removeBinding({ name: NATIVE_AUTOMATION_STORAGE_BINDING });

        sessionStorageLogger('stop');
    }
}
