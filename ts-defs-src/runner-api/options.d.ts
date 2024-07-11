
// {{#allowReferences}}
// NOTE: Must be added manually to the top of the index.d.ts template
/// <reference types="node" />

/// <reference path="../test-api/client-script.d.ts" />
/// <reference path="../test-api/action-options.d.ts" />
/// <reference path="../test-api/skip-js-errors-options.d.ts" />
/// <reference path="../test-api/test-info.d.ts" />
// {{/allowReferences}}

type TlsOptions = import('tls').TlsOptions;

interface AppOptions {
    command: string;
    initDelay?: number;
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

interface BrowserDescriptor {
    path: string;
    cmd?: string;
}

type BrowserOption = string | BrowserConnection | BrowserDescriptor;
type BrowserOptions = BrowserOption | BrowserOption [];

type CompilerOptions = {
    [key in 'typescript']: object;
};

type ConcurrencyOption = number;

type ClientScriptOptions = ClientScript | ClientScript [];

/**
* Allows you to select which tests should be run.
*
* @param testName - The name of the test.
* @param fixtureName - The name of the test fixture.
* @param fixturePath - The path to the test fixture file.
* @param testMeta - The test metadata.
* @param fixtureMeta - The fixture metadata.
*/
type FilterFunction = (
    testName: string,
    fixtureName: string,
    fixturePath: string,
    testMeta: Metadata,
    fixtureMeta: Metadata
) => Promise<boolean> | boolean;

interface FilterDescriptor {
    test?: string;
    testGrep?: string;
    fixture?: string;
    fixtureGrep?: string;
    testMeta?: Metadata;
    fixtureMeta?: Metadata;
}

interface ReporterDescriptor {
    name: string;
    output?: string | NodeJS.WritableStream;
}

type ReporterOption = string | ReporterDescriptor;
type ReporterOptions = ReporterOption | ReporterOptions [];

type SourceOption = string;
type SourceOptions = SourceOption | SourceOption [];

interface ScreenshotsOptions extends TakeScreenshotOptions {
    /**
     * Specifies the base directory where the screenshots are saved.
     */
    path?: string;
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

interface VideoConfigOptions {
    path: string;
    options?: VideoOptions;
    encodingOptions?: VideoEncodingOptions;
}

interface ProxyOptions {
    host: string;
    bypassRules?: string | string [];
}

interface QuarantineModeOptions {
    attemptLimit?: number;
    successThreshold?: number;
}

interface RunOptions {
    /**
     * Defines the framework's response to client-side JavaScript errors. If `false` (the default value), tests fail after the website yields a client-side error. If `true`, TestCafe ignores JavaScript errors. Additional options set custom error handling criteria.
     */
    skipJsErrors: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject;
    /**
     * Defines whether to continue running a test after an uncaught error or unhandled promise rejection occurs on the server (`true`), or consider such a test failed (`false`).
     */
    skipUncaughtErrors: boolean;
    /**
     * Defines whether to enable quarantine mode and (optionally) what settings to use.
     */
    quarantineMode: boolean | QuarantineModeOptions;
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
    /**
     * Time (in milliseconds). If a test is unresponsive for the specified length of time, TestCafe terminates it. Only applies to test contents.
     */
    testExecutionTimeout: number;
    /**
     * Time (in milliseconds). If TestCafe is idle for the specified length of time, TestCafe terminates the test run. Applies to actions inside and outside tests.
     */
    runExecutionTimeout: number;
    /**
     * Disables support for multi-window testing in Chrome and Firefox. Use this option if you encounter compatibility issues with your existing tests.
     */
    disableMultipleWindows: boolean;
    /**
     * Disables native automation of Chromium-based browsers. Use this option to speed up browser automation and increase test stability.
     */
    disableNativeAutomation: boolean;
     /**
     * Allows you to import modules that do not support CommonJS.
     */
    esm: boolean;
}

interface StartOptions {
    hostname: string;
    port1: number;
    port2: number;
    ssl: TlsOptions;
    developmentMode: boolean;
    retryTestPages: boolean;
    cache: boolean;
    configFile: string;
    disableHttp2: boolean;
}

interface ColorOutputOptions {
    color: boolean;
    noColor: boolean;
}
