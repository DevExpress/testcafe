import TestRun from '../../test-run';
import BrowserConnection from '../../browser/connection';
import { UserScript } from 'testcafe-hammerhead';
import { InjectableResourcesOptions } from '../types';

export default class TestRunBridge {
    private readonly _browserId: string;
    private readonly _windowId: string;
    public constructor (browserId: string, windowId: string) {
        this._browserId = browserId;
        this._windowId = windowId;
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

    public getInjectableScripts (): string[] {
        const currentTestRun = this.getCurrentTestRun();

        if (!currentTestRun)
            return [];

        return currentTestRun.injectable.scripts;
    }

    public getInjectableStyles (): string[] {
        const currentTestRun = this.getCurrentTestRun();

        if (!currentTestRun)
            return [];

        return currentTestRun.injectable.styles;
    }

    public async getTaskScript ({ isIframe }: InjectableResourcesOptions): Promise<string> {
        const browserConnection = this.getBrowserConnection();
        const proxy             = browserConnection.browserConnectionGateway.proxy;
        const windowId          = this._windowId;

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
