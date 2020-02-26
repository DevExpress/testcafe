
// {{#allowReferences}}
/// <reference path="client-script.d.ts" />
/// <reference path="test-controller.d.ts" />
// {{/allowReferences}}

interface HTTPAuthCredentials {
    /**
     * The user name for the account.
     */
    username: string;
    /**
     * The password for the account.
     */
    password: string;
    /**
     * The domain name.
     */
    domain?: string;
    /**
     * The workstation's ID in the local network.
     */
    workstation?: string;
}

interface FixtureFn {
    /**
     * Declares a test fixture.
     *
     * @param name - The name of the fixture.
     * @param tagArgs - tag function arguments required to support the "fixture`${x}`" syntax
     */
    (name: string | TemplateStringsArray, ...tagArgs: any[]): this;
    /**
     * Specifies a webpage at which all tests in a fixture start.
     *
     * @param url - The URL of the webpage where tests start.
     * @param tagArgs - tag function arguments required to support the "fixture.page`${x}`" syntax
     * To test webpages in local directories, you can use the `file://` scheme or relative paths.
     */
    page(url: string | TemplateStringsArray, ...tagArgs: any[]): this;
    /**
     * Specifies HTTP Basic or Windows (NTLM) authentication credentials for all tests in the fixture.
     *
     * @param credentials - Contains credentials used for authentication.
     */
    httpAuth(credentials: HTTPAuthCredentials): this;
    /**
     * Specifies the fixture hook that is executed before the start of the first test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `ctx` - A fixture context object used to share variables between fixture hooks and test code.
     */
    before(fn: (ctx: {[key: string]: any}) => Promise<any>): this;
    /**
     * Specifies the fixture hook that is executed after the end of the last test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `ctx` - A fixture context object used to share variables between fixture hooks and test code.
     */
    after(fn: (ctx: {[key: string]: any}) => Promise<any>): this;
    /**
     * Specifies the hook that is executed on the start of each test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    beforeEach(fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies the hook that is executed on the end of each test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    afterEach(fn: (t: TestController) => Promise<any>): this;
    /**
     * Skips execution of all tests in the fixture.
     */
    skip: this;
    /**
     * Skips execution of all tests, except whose that are in this fixture.
     */
    only: this;
    /**
     * Disables page caching for tests in this fixture.
     */
    disablePageCaching: this;
    /**
     * WARNING: This feature is experimental and is not recommended for everyday use. It can be removed in the future TestCafe versions.
     *
     * Disables page reloading which would happen right before each test in this fixture.
     */
    disablePageReloads: this;
    /**
     * Specifies the additional information for all tests in the fixture. This information can be used in reports.
     *
     * @param key - The name of the metadata entry
     * @param value - The value of the metadata entry
     */
    meta(key: string, value: string): this;
    /**
     * Specifies the additional information for all tests in the fixture. This information can be used in reports.
     *
     * @param data - Key-value pairs
     */
    meta(data: object): this;
    /**
     * Attaches hooks to all tests in the fixture
     *
     * @param hooks - The set of the RequestHook subclasses
     */
    requestHooks(...hooks: object[]): this;
    /**
     * Injects scripts into pages visited during the fixture execution.
     *
     * @param scripts - Scripts that should be added to the tested pages.
     */
    clientScripts (scripts: ClientScript | ClientScript[]): this;
}

interface TestFn {
    /**
     * Declares a test.
     *
     * @param name - The name of the test.
     * @param fn - An asynchronous function that contains test code.
     * @param fn `t` - The test controller used to access test run API.
     */
    (name: string, fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies a webpage at which test starts.
     *
     * @param url - The URL of the webpage at which this test starts.
     * To test webpages in local directories, you can use the `file://` scheme or relative paths.
     */
    page(url: string): this;
    /**
     * Specifies HTTP Basic or Windows (NTLM) authentication credentials for the test.
     *
     * @param credentials - Contains credentials used for authentication.
     */
    httpAuth(credentials: HTTPAuthCredentials): this;
    /**
     * Specifies hook that is executed on the start of the test.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    before(fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies hook that is executed on the end of the test.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    after(fn: (t: TestController) => Promise<any>): this;
    /**
     * Skips test execution.
     */
    skip: this;
    /**
     * Skips execution of all tests, except this one.
     */
    only: this;
    /**
     * Disables page caching for this test.
     */
    disablePageCaching: this;
    /**
     * WARNING: This feature is experimental and is not recommended for everyday use. It can be removed in the future TestCafe versions.
     *
     * Disables page reloading which would happen right before this test.
     */
    disablePageReloads: this;
    /**
     * Specifies the additional information for the test. This information can be used in reports.
     *
     * @param key - The name of the metadata entry
     * @param value - The value of the metadata entry
     */
    meta(key: string, value: string): this;
    /**
     * Specifies the additional information for the test. This information can be used in reports.
     *
     * @param data - Key-value pairs
     */
    meta(data: object): this;
    /**
     * Attaches hooks to the test
     *
     * @param hooks - The set of the RequestHook subclasses
     */
    requestHooks(...hooks: object[]): this;
    /**
     * Injects scripts into pages visited during the test execution.
     *
     * @param scripts - Scripts that should be added to the tested pages.
     */
    clientScripts (scripts: ClientScript | ClientScript[]): this;
}
