
// {{#allowReferences}}
// NOTE: Must be added manually to the top of the index.d.ts template
/// <reference types="node" />

/// <reference path="../test-api/client-script.d.ts" />
/// <reference path="../test-api/action-options.d.ts" />
// {{/allowReferences}}

type TlsOptions = import('tls').TlsOptions;

interface ScreenshotsOptions extends TakeScreenshotOptions {
    /**
     * Specifies the base directory where the screenshots are saved.
     */
    path: string;
    /**
     * Specifies that a screenshot should be taken whenever a test fails.
     */
    takeOnFails?: boolean;
    /**
     * Specifies a custom pattern to compose screenshot files' relative path and name.
     */
    pathPattern?: string;
}

interface VideoOptions {
    /**
     * Specifies whether to save the entire recording as a single file.
     */
    singleFile?: boolean;
    /**
     * Specifies whether to record only failed tests.
     */
    failedOnly?: boolean;
    /**
     * Specifies the path to the FFmpeg codec executable.
     */
    ffmpegPath?: string;
    /**
     * Specifies a custom pattern that defines how TestCafe composes the relative path to a video file.
     */
    pathPattern?: string;
}

interface DefaultEncodingOptions {
    /**
     * **NOTE:** overwrite output files without asking for a confirmation
     * @default true
     */
    y: boolean;
    /**
     * **NOTE:** use the time when a frame is read from the source as its timestamp
     *
     * **IMPORTANT:** must be specified before configuring the source
     * @default 1
     */
    'use_wallclock_as_timestamps': number;
    /**
     * **NOTE:** use stdin as a source
     * @default 'pipe:0'
     */
    i: string;
    /**
     * **NOTE:** use the H.264 video codec
     * @default 'libx264'
     */
    'c:v': string;
    /**
     * **NOTE:** use the `ultrafast` compression preset
     * @default 'ultrafast'
     */
    preset: string;

    /**
     * **NOTE:** use the yuv420p pixel format (the most widely supported)
     * @default 'yuv420p'
     */
    'pix_fmt': string;
    /**
     * **NOTE:** scale input frames to make the frame height divisible by 2 (yuv420p's requirement)
     * @default 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
     */
    vf: string;
    /**
     * Specifies a custom frame rate (FPS).
     * @default 30
     */
    r: number;
}

interface VideoEncodingOptions extends Partial<DefaultEncodingOptions> {
    /**
     * https://ffmpeg.org/ffmpeg.html#Options
     *
     * custom ffmpeg options
     */
    [option: string]: unknown;

    /**
     * Specifies the video's aspect ratio.
     *
     * Can be set to '4:3', '16:9', etc.
     */
    aspect?: string;
}

type CompilerOptions = {
    [key in 'typescript']: object;
};

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
     * @param callback `testName` - The name of the test.
     * @param callback `fixtureName` - The name of the test fixture.
     * @param callback `fixturePath` - The path to the test fixture file.
     * @param callback `testMeta` - The test metadata.
     * @param callback `fixtureMeta` - The fixture metadata.
     */
    filter(
        callback: (
            testName: string,
            fixtureName: string,
            fixturePath: string,
            testMeta: Record<string, string>,
            fixtureMeta: Record<string, string>
        ) => boolean
    ): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - A different browser alias for each browser type.
     */
    browsers(browser: string | string[]): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - The path to the browser's executable (path) and command line parameters (cmd).
     */
    browsers(browser: { path: string; cmd?: string }): this;

    /**
     * Configures the test runner to run tests in the specified browsers.
     *
     * @param browser - The remote browser connection.
     */
    browsers(browser: BrowserConnection): this;

    /**
     * Enables TestCafe to take screenshots of the tested webpages.
     *
     * @param path - The base path where the screenshots are saved. Note that to construct a complete path to these screenshots, TestCafe uses default path patterns.
     * @param takeOnFails - Specifies if screenshots should be taken automatically when a test fails.
     * @param pathPattern - The pattern to compose screenshot files' relative path and name.
     */
    screenshots(path: string, takeOnFails?: boolean, pathPattern?: string): this;

    /**
     *
     * Enables TestCafe to take screenshots of the tested webpages.
     *
     * @param options - Screenshots options
     */
    screenshots(options: ScreenshotsOptions): this;

    /**
     * https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/screenshots-and-videos.html#basic-video-options
     *
     * Enables TestCafe to take videos of the tested webpages.
     *
     * @param path - Output directory
     * @param options - Video options
     * @param encodingOptions - Video encoding options
     */
    video(path: string, options?: VideoOptions, encodingOptions?: VideoEncodingOptions): this;

    /**
     * Configures TestCafe's reporting feature.
     *
     * @param name - The name of the reporter to use.
     * @param output - The stream or the name of the file to which the report is written.
     */
    reporter(name: string, output?: string | NodeJS.WritableStream): this;

    /**
     * Configures TestCafe's reporting feature.
     *
     * @param reporters An array of reporters
     */
    reporter(reporters: Array<string | { name: string, output?: string | NodeJS.WritableStream }>): this;

    /**
     * Specifies that tests should run concurrently.
     *
     * @param n - The number of browser instances that are invoked.
     */
    concurrency(n: number): this;

    /**
     * Specifies a shell command that is executed before running tests. Use it to launch or deploy the application that is tested.
     *
     * @param command - The shell command to be executed.
     * @param initDelay - The amount of time (in milliseconds) allowed for the command to initialize the tested application.
     */
    startApp(command: string, initDelay?: number): this;

    /**
     * Specifies the proxy server used in your local network to access the Internet. Allows you to bypass the proxy when accessing specific resources.
     *
     * @param host - The proxy server host.
     * @param bypassRules - A set of rules that specify which resources are accessed bypassing the proxy.
     */
    useProxy(host: string, bypassRules?: string | string[]): this;

    /**
     * Injects scripts into pages visited during the test execution.
     *
     * @param scripts - Scripts that should be added to the tested pages.
     */
    clientScripts (scripts: ClientScript | ClientScript[]): this;

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

interface BrowserConnection {
    /**
     * A URL that should be visited from a remote browser in order to connect it to the TestCafe server.
     */
    url: string;

    /**
     * Fires when a remote browser connects to the TestCafe server.
     */
    once(event: 'ready', callback: Function): void;
}

interface RunOptions {
    /**
     * Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).
     */
    skipJsErrors: boolean;
    /**
     * Defines whether to continue running a test after an uncaught error or unhandled promise rejection occurs on the server (`true`), or consider such a test failed (`false`).
     */
    skipUncaughtErrors: boolean;
    /**
     * Defines whether to enable quarantine mode and (optionally) what settings to use.
     */
    quarantineMode: boolean | Record<string, string>;
    /**
     * Specifies if tests run in the debug mode. If this option is enabled, test execution is paused before the first action or assertion allowing you to invoke the developer tools and debug. In the debug mode, you can execute the test step-by-step to reproduce its incorrect behavior. You can also use the Unlock Page switch in the footer to unlock the tested page and interact with its elements.
     */
    debugMode: boolean;
    /**
     * Specifies whether to enter the debug mode when a test fails. If enabled, the test is paused at the moment it fails, so that you can explore the tested page to determine what caused the failure.
     */
    debugOnFail: boolean;
    /**
     * Specifies the time (in milliseconds) within which selectors make attempts to obtain a node to be returned.
     */
    selectorTimeout: number;
    /**
     * Specifies the time (in milliseconds) within which TestCafe makes attempts to successfully execute an assertion if a selector property or a client function was passed as an actual value.
     */
    assertionTimeout: number;
    /**
     * Specifies the time (in milliseconds) TestCafe waits for the  window.load event to fire after the  DOMContentLoaded event. After the timeout passes or the window.load event is raised (whichever happens first), TestCafe starts the test. You can set this timeout to 0 to skip waiting for window.load.
     */
    pageLoadTimeout: number;
    /**
     * Specifies the time (in milliseconds) TestCafe waits for the browser to start
     */
    browserInitTimeout: number;
    /**
     * Specifies the test execution speed. A number between 1 (fastest) and 0.01 (slowest). If an individual action's speed is also specified, the action speed setting overrides the test speed.
     */
    speed: number;
    /**
     * Defines whether to stop a test run if a test fails. This allows you not to wait for all the tests to finish and to focus on the first error.
     */
    stopOnFirstFail: boolean;
    /**
     * Defines whether to disable checks for test and fixture directives in test files. Use this option to run dynamically loaded tests.
     */
    disableTestSyntaxValidation: boolean;
    /**
     * Defines whether to disable page caching during test execution.
     */
    disablePageCaching: boolean;
    /**
     * Specifies the timeout in milliseconds to complete the request for the page's HTML
     */
    pageRequestTimeout: number;
    /**
     * Specifies the timeout in milliseconds to complete the AJAX requests (XHR or fetch)
     */
    ajaxRequestTimeout: number;
    /**
     * Prevents TestCafe from taking screenshots. When this option is specified, screenshots are not taken whenever a test fails or when t.takeScreenshot or t.takeElementScreenshot is executed.
     */
    disableScreenshots: boolean;
}

interface TestCafeFactory {
    (
        hostname?: string,
        port1?: number,
        port2?: number,
        sslOptions?: TlsOptions,
        developmentMode?: boolean,
        retryTestPages?: boolean,
        cache?: boolean,
        configFile?: string
    ): Promise<TestCafe>;
}
