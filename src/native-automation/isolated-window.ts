// Stripped-down NativeAutomation for isolated sessions (no request interception)
import { ProtocolApi } from 'chrome-remote-interface';
import { NativeAutomationBase } from './index';
import { NativeAutomationInitOptions } from '../shared/types';
import NativeAutomationApiBase from './api-base';

/**
 * Thin wrapper over NativeAutomationBase for isolated browser sessions.
 * Exposes the CDP client and target ID for direct command execution.
 * Has no-op start()/dispose() since isolated tabs don't use the request
 * interception pipeline or hammerhead proxy.
 */
export class NativeAutomationIsolatedWindow extends NativeAutomationBase {
    public readonly browserContextId: string;

    public constructor (browserId: string, windowId: string, client: ProtocolApi, options: NativeAutomationInitOptions, browserContextId: string) {
        super(browserId, windowId, client, options, false);

        this.browserContextId = browserContextId;
    }

    // Expose the CDP client for direct command execution
    public get cdpClient (): ProtocolApi {
        return this._client;
    }

    // Expose the target ID for CDP Browser.getWindowForTarget
    public get targetId (): string {
        return this.windowId;
    }

    // Override apiSystems to return empty — isolated sessions use CDP-direct
    // execution and do not need the request pipeline or session storage
    public get apiSystems (): NativeAutomationApiBase[] {
        return [];
    }

    // No-op start — skip event listeners and pipeline startup
    public async start (): Promise<void> {
        // Isolated sessions execute commands directly via CDP.
        // No request interception or session storage sync needed.
    }

    // No-op dispose — no pipeline to tear down
    public async dispose (): Promise<void> {
        // Nothing to clean up — the browser context disposal handles tab cleanup
    }
}
