declare module testcafe {
    class TestController {

    }

    export interface HTTPAuthCredentials {
        username: string,
        password: string,
        domain?: string,
        workstation?: string
    }

    interface FixtureDescriptor {
        page: (name: string) => this,
        httpAuth: (credentials: HTTPAuthCredentials) => this,
        skip: this,
        only: this,
        before: (fn: () => Promise<any>) => this,
        after: (fn: () => Promise<any>) => this,
        beforeEach: (fn: (t: TestController) => Promise<any>) => this,
        afterEach: (fn: (t: TestController) => Promise<any>) => this
    }
}

declare var fixture: (name: string) => testcafe.FixtureDescriptor;
declare var test: (name: string, fn: (t: testcafe.TestController) => Promise<any>) => void;

