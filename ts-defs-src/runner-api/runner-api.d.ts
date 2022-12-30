
// {{#allowReferences}}
/// <reference path="./options.d.ts" />
// {{/allowReferences}}

interface TestCafe {
    /**
     * Creates the test runner that is used to configure and launch test tasks.
     */
    createRunner(): Runner;

    /**
     * Creates the live mode test runner that is used to configure and launch test tasks.
     */
    createLiveModeRunner(): Runner;

    /**
     * Creates a remote browser connection.
     */
    createBrowserConnection(): Promise<BrowserConnection>;

    /**
     * Stops the TestCafe server. Forcibly closes all connections and pending test runs immediately.
     */
    close(): Promise<void>;
}

interface Runner {
    /**
     * Configures the test runner to run tests from the specified files.
     *
     * @param source - The relative or absolute path to a test fixture file, or several such paths. You can use glob patterns to include (or exclude) multiple files.
     */
    src(source: string | string[]): this;

    /**
     * Allows you to select which tests should be run.
     *
     * @param callback - The callback that determines if a particular test should be run.
     */
    filter(callback: FilterFunction): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - A different browser alias for each browser type.
     */
    browsers(browser: string | string[]): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - The path to the browser's executable (BrowserDescriptor.path) and command line parameters (BrowserDescriptor.cmd).
     */
    browsers(browser: BrowserDescriptor): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - The remote browser connection.
     */
    browsers(browser: BrowserConnection): this;

    browsers(browsers: BrowserOptions): this;
    browsers(...browsers: BrowserOption[]): this;

    /**
     * Enables TestCafe to take screenshots of the tested webpages.
     *
     * @param path - The base path where the screenshots are saved. Note that to construct a complete path to these screenshots, TestCafe uses default path patterns.
     * @param takeOnFails - Specifies if screenshots should be taken automatically when a test fails.
     * @param pathPattern - The pattern to compose screenshot files' relative path and name.
     */
    screenshots(
        path:         ScreenshotsOptions['path'],
        takeOnFails?: ScreenshotsOptions['takeOnFails'],
        pathPattern?: ScreenshotsOptions['pathPattern']
    ): this;

    /**
     *
     * Enables TestCafe to take screenshots of the tested webpages.
     *
     * @param options - Screenshots options
     */
    screenshots(options: ScreenshotsOptions): this;

    /**
     * https://testcafe.io/documentation/402840/guides/advanced-guides/screenshots-and-videos#basic-video-options
     *
     * Enables TestCafe to take videos of the tested webpages.
     *
     * @param path - Output directory
     * @param options - Video options
     * @param encodingOptions - Video encoding options
     */
    video(
        path: VideoConfigOptions['path'],
        options?: VideoConfigOptions['options'],
        encodingOptions?: VideoConfigOptions['encodingOptions']
    ): this;

    /**
     * Configures TestCafe's reporting feature.
     *
     * @param name - The name of the reporter to use.
     * @param output - The stream or the name of the file to which the report is written.
     */
    reporter(name: ReporterDescriptor['name'], output?: ReporterDescriptor['output']): this;

    /**
     * Configures TestCafe's reporting feature.
     *
     * @param reporters An array of reporters
     */
    reporter(reporters: ReporterOptions): this;

    /**
     * Specifies that tests should run concurrently.
     *
     * @param n - The number of browser instances that are invoked.
     */
    concurrency(n: ConcurrencyOption): this;

    /**
     * Specifies a shell command that is executed before running tests. Use it to launch or deploy the application that is tested.
     *
     * @param command - The shell command to be executed.
     * @param initDelay - The amount of time (in milliseconds) allowed for the command to initialize the tested application.
     */
    startApp(command: AppOptions['command'], initDelay?: AppOptions['initDelay']): this;

    /**
     * Specifies the proxy server used in your local network to access the Internet. Allows you to bypass the proxy when accessing specific resources.
     *
     * @param host - The proxy server host.
     * @param bypassRules - A set of rules that specify which resources are accessed bypassing the proxy.
     */
    useProxy(host: ProxyOptions['host'], bypassRules?: ProxyOptions['bypassRules']): this;

    /**
     * Injects scripts into pages visited during the test execution.
     *
     * @param scripts - Scripts that should be added to the tested pages.
     */
    clientScripts (scripts: ClientScriptOptions): this;

    /**
     * Runs tests according to the current configuration. Returns the number of failed tests.
     */
    run(options?: Partial<RunOptions>): Promise<number>;

    /**
     * Stops all the pending test tasks.
     */
    stop(): void;

    /**
     * The absolute or relative path to the TypeScript configuration file. Relative paths resolve from the current directory (the directory from which you run TestCafe).
     */
    tsConfigPath(path: string): this;

    /**
     * Specifies custom compiler options for built-in test file compilers.
     */
    compilerOptions(compilerOptions: CompilerOptions): this;
}

interface TestCafeFactory {
    (configuration: Partial<TestCafeConfigurationOptions>): Promise<TestCafe>;

    // NOTE: Positional arguments support is left only for backward compatibility.
    // It should be removed in future TestCafe versions.
    // All new APIs should be enabled trough the configuration object in the upper clause.
    // Please do not add new APIs here.
    (
        hostname?: StartOptions['hostname'],
        port1?: StartOptions['port1'],
        port2?: StartOptions['port2'],
        sslOptions?: StartOptions['ssl'],
        developmentMode?: StartOptions['developmentMode'],
        retryTestPages?: StartOptions['retryTestPages'],
        cache?: StartOptions['cache'],
        configFile?: StartOptions['configFile']
    ): Promise<TestCafe>;
}
