import TestRun from '../../test-run';
import BrowserConnection from '../../browser/connection';
import { UserScript } from 'testcafe-hammerhead';
import { InjectableResourcesOptions } from '../types';

export default class TestRunBridge {
    private readonly _browserId: string;
    public constructor (browserId: string) {
        this._browserId = browserId;
    }

    public getBrowserConnection (): BrowserConnection {
        return BrowserConnection.getById(this._browserId) as BrowserConnection;
    }

    public getCurrentTestRun (): TestRun {
        const browserConnection = this.getBrowserConnection();

        return browserConnection.getCurrentTestRun();
    }

    public getSessionId (): string {
        return this.getCurrentTestRun()?.id || '';
    }

    public getUserScripts (): UserScript[] {
        const currentTestRun = this.getCurrentTestRun();

        if (!currentTestRun)
            return [];

        return currentTestRun.injectable.userScripts;
    }

    public async getTaskScript ({ isIframe }: InjectableResourcesOptions): Promise<string> {
        const browserConnection = this.getBrowserConnection();
        const proxy             = browserConnection.browserConnectionGateway.proxy;
        const windowId          = browserConnection.activeWindowId;

        // @ts-ignore
        return await this.getCurrentTestRun().session.getTaskScript({
            referer:     '',
            cookieUrl:   '',
            withPayload: true,
            serverInfo:  proxy.server1Info,
            windowId,
            isIframe,
        });
    }
}
