import { ExternalCookies } from 'testcafe-hammerhead';
import TestRun from '../';
import { CookieOptions } from '../commands/options';

export interface CookieProvider {
    initialize: () => Promise<void>,
    setCookies: (cookies: CookieOptions[], url: string) => Promise<void>,
    getCookies: (externalCookies: ExternalCookies[], urls: string[]) => Promise<ExternalCookies[]>,
    deleteCookies (cookies?: CookieOptions[], urls?: string[]): Promise<void>;
}

export class CookieProviderBase {
    protected testRun: TestRun;

    constructor (testRun: TestRun) {
        this.testRun = testRun;
    }

    async initialize (): Promise<void> {
        return Promise.resolve();
    }
}
