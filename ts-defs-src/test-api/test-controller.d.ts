
// {{#allowReferences}}
/// <reference path="action-options.d.ts" />
/// <reference path="assertions.d.ts" />
/// <reference path="client-function.d.ts" />
/// <reference path="client-script.d.ts" />
/// <reference path="role.d.ts" />
/// <reference path="selector.d.ts" />
// {{/allowReferences}}

interface NativeDialogHistoryItem {
    /**
     * The type of the native dialog.
     */
    type: 'alert' | 'confirm' | 'beforeunload' | 'prompt';
    /**
     * Text of the dialog message.
     */
    text: string;
    /**
     * The URL of the page that invoked the dialog. Use it to determine if the dialog originated
     * from the main window or an `<iframe>`.
     */
    url: string;
}

interface BrowserConsoleMessages {
    /**
     * Messages output to the browser console by the console.log() method.
     */
    log: string[];
    /**
     * Warning messages output to the browser console by the console.warn() method.
     */
    warn: string[];
    /**
     * Error messages output to the browser console by the console.error() method.
     */
    error: string[];
    /**
     * Information messages output to the browser console by the console.info() method.
     */
    info: string[];
}

interface Browser {
    /**
     * The browser alias string specified when tests were launched.
     */
    alias: string;
    /**
     * The browser name.
     */
    name: string;
    /**
     * The browser version.
     */
    version: string;
    /**
     * The platform type.
     */
    platform: string;
    /**
     * `true` if the browser runs in headless mode.
     */
    headless: boolean;
    /**
     * The name and version of the operating system.
     */
    os: { name: string; version: string };
    /**
     * The name and version of the browser engine.
     */
    engine: { name: string; version: string };
    /**
     * The user agent string.
     */
    userAgent: string;
    /**
     * Formatted string with the browser's and operating system's name and version.
     */
    prettyUserAgent: string;
}

type WindowDescriptor = unknown;

interface WindowFilterData {
    /**
     * The window title.
     */
    title: string;

    /**
     * The window URL.
     */
    url: URL;
}

type ScrollPosition = 'top' | 'right' | 'bottom' | 'left' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center';

interface TestController {
    /**
     * Dictionary that is shared between test hook functions and test code.
     */
    ctx: {[key: string]: any};
    /**
     * Dictionary that is shared between `fixture.before` and `fixture.after`, test hook functions and test code.
     */
    readonly fixtureCtx: {[key: string]: any};
    /**
     * Returns an object that contains browser information.
     */
    readonly browser: Browser;
    /**
     * Dispatches an event over a specified webpage element.
     *
     * @param selector - Identifies the EventTarget element.
     * @param eventName - The name of the event to be dispatched on the DOM element..
     * @param options - The options which will be passed to EventConstructor.
     */
    dispatchEvent(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  eventName: string, options?: object): TestControllerPromise;
    /**
     * Clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    click(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: ClickActionOptions): TestControllerPromise;
    /**
     * Right-clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being right-clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    rightClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               options?: ClickActionOptions): TestControllerPromise;
    /**
     * Double-clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being double-clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    doubleClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                options?: ClickActionOptions): TestControllerPromise;
    /**
     * Hovers the mouse pointer over a webpage element.
     *
     * @param selector - Identifies the webpage element being hovered over.
     * @param options - A set of options that provide additional parameters for the action.
     */
    hover(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: MouseActionOptions): TestControllerPromise;
     /**
     * Scrolls the document element to the { scrollLeft, scrollTop } position.
     *
     * @param scrollLeft - The position along the horizontal axis of the document.
     * @param scrollTop - The position along the vertical axis of the document.
     */
    scroll(posX: number, posY: number): TestControllerPromise;

    /**
     * Scrolls the document element to the predefined position.
     *
     * @param position - The position to scroll the document to. Valid values are topLeft, top, topRight, left, center, right, bottomLeft, bottom, bottomRight
     */
    scroll(position: ScrollPosition): TestControllerPromise;

    /**
     * Scrolls the specified element to the { scrollLeft, scrollTop } position.
     *
     * @param selector - Identifies the webpage element being hovered over.
     * @param scrollLeft - The position along the horizontal axis of the document.
     * @param scrollTop - The position along the vertical axis of the document.
     * @param options - A set of options that provide additional parameters for the action.
     */
    scroll(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         scrollLeft: number, scrollTop: number, options?: OffsetOptions): TestControllerPromise;

    /**
     * Scrolls the specified element to the predefined position.
     *
     * @param selector - Identifies the webpage element being hovered over.
     * @param position - The position to scroll the document to. Valid values are topLeft, top, topRight, left, center, right, bottomLeft, bottom, bottomRight
     * @param options - A set of options that provide additional parameters for the action.
     */
    scroll(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         position: ScrollPosition, options?: OffsetOptions): TestControllerPromise;

    /**
     * Scrolls the document element by the given offset.
     *
     * @param scrollLeft - The horizontal pixel value that you want to scroll by.
     * @param scrollTop - The vertical pixel value that you want to scroll by.
     */
    scrollBy(x: number, y: number): TestControllerPromise;

    /**
     * Scrolls the specified element by the given offset.
     * @param selector - Identifies the webpage element being hovered over.
     * @param scrollLeft - The horizontal pixel value that you want to scroll by.
     * @param scrollTop - The vertical pixel value that you want to scroll by.
     * @param options - A set of options that provide additional parameters for the action.
     */
    scrollBy(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         x: number, y: number, options?: OffsetOptions): TestControllerPromise;

    /**
     * Scrolls the specified element into view.
     * @param selector - Identifies the webpage element being hovered over.
     * @param options - A set of options that provide additional parameters for the action.
     */
    scrollIntoView(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         options?: OffsetOptions): TestControllerPromise;

    /**
     * Drags an element by an offset.
     *
     * @param selector - Identifies the webpage element being dragged
     * @param dragOffsetX - An X-offset of the drop coordinates from the mouse pointer's initial position.
     * @param dragOffsetY - An Y-offset of the drop coordinates from the mouse pointer's initial position.
     * @param options - A set of options that provide additional parameters for the action.
     */
    drag(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         dragOffsetX: number,
         dragOffsetY: number,
         options?: MouseActionOptions): TestControllerPromise;
    /**
     * Drags an element onto another one.
     *
     * @param selector - Identifies the webpage element being dragged.
     * @param destinationSelector - Identifies the webpage element that serves as the drop location.
     * @param options - A set of options that provide additional parameters for the action.
     */
    dragToElement(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  destinationSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  options?: DragToElementOptions): TestControllerPromise;
    /**
     * Types the specified text into an input element.
     *
     * @param selector - Identifies the webpage element that will receive input focus.
     * @param text - The text to be typed into the specified webpage element.
     * @param options - A set of options that provide additional parameters for the action.
     */
    typeText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
             text: string,
             options?: TypeActionOptions): TestControllerPromise;
    /**
     * Selects text in input elements.
     *
     * @param selector - Identifies the webpage element whose text will be selected.
     * @param startPos - The start position of the selection. A zero-based integer.
     * @param endPos - The end position of the selection. A zero-based integer.
     * @param options - A set of options that provide additional parameters for the action.
     */
    selectText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               startPos?: number,
               endPos?: number,
               options?: ActionOptions): TestControllerPromise;
    /**
     * Selects `<textarea>` content.
     *
     * @param selector
     * @param startLine
     * @param startPos
     * @param endLine
     * @param endPos
     * @param options
     */
    selectTextAreaContent(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          startLine?: number,
                          startPos?: number,
                          endLine?: number,
                          endPos?: number,
                          options?: ActionOptions): TestControllerPromise;
    /**
     * Performs selection within editable content
     *
     * @param startSelector - Identifies a webpage element from which selection starts. The start position of selection is the first character of the element's text.
     * @param endSelector - Identifies a webpage element at which selection ends. The end position of selection is the last character of the element's text.
     * @param options - A set of options that provide additional parameters for the action.
     */
    selectEditableContent(startSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          endSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          options?: ActionOptions): TestControllerPromise;
    /**
     * Presses the specified keyboard keys.
     *
     * @param keys - The sequence of keys and key combinations to be pressed.
     * @param options - A set of options that provide additional parameters for the action.
     */
    pressKey(keys: string, options?: PressActionOptions): TestControllerPromise;
    /**
     * Pauses a test for a specified period of time.
     *
     * @param timeout - The pause duration, in milliseconds.
     */
    wait(timeout: number): TestControllerPromise;
    /**
     * Navigates to the specified URL.
     *
     * @param url - The URL to navigate to. Absolute or relative to the current page.
     * You can use the `file://` scheme or relative paths to navigate to a webpage in a local directory.
     */
    navigateTo(url: string): TestControllerPromise;
    /**
     * Populates the specified file upload input with file paths.
     *
     * @param selector - Identifies the input field to which file paths are written.
     * @param filePath - The path to the uploaded file, or several such paths. Relative paths resolve from the folder with the test file.
     */
    setFilesToUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                     filePath: String | String[]): TestControllerPromise;
    /**
     * Removes all file paths from the specified file upload input.
     *
     * @param selector - Identifies the input field that needs to be cleared.
     */
    clearUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;
    /**
     * Takes a screenshot of the tested page.
     *
     * @param path - relative path to the screenshot file. Resolved from the screenshot directory specified by
     * using the `runner.screenshots` API method or the `screenshots-path` command line option.
     * If path doesn't have .png extension, it will be added automatically.
     */
    takeScreenshot(path?: string): TestControllerPromise;
    /**
     * Takes a screenshot of the tested page.
     *
     * @param options - TakeScreenshot Options
     */
    takeScreenshot(options: TakeScreenshotOptions): TestControllerPromise;
    /**
     * Takes a screenshot of the specified element.
     *
     * @param selector - Identifies the element for screenshot capturing.
     * @param path - relative path to the screenshot file. Resolved from the screenshot  directory specified by
     * using the `runner.screenshots` API method or the `screenshots-path` command line option.
     * If path doesn't have .png extension, it will be added automatically.
     */
    takeElementScreenshot(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          path?:    string,
                          options?: TakeElementScreenshotOptions): TestControllerPromise;
    /**
     * Sets the browser window size.
     *
     * @param width - The new width, in pixels.
     * @param height - The new height, in pixels.
     */
    resizeWindow(width: number, height: number): TestControllerPromise;

    /**
     * Fits the browser window into a particular device.
     *
     * @param deviceName - The name of the device as listed at https://github.com/DevExpress/device-specs/blob/master/viewport-sizes.json.
     * @param options - Provide additional information about the device.
     */
    resizeWindowToFitDevice(deviceName: string, options?: ResizeToFitDeviceOptions): TestControllerPromise;
    /**
     * Maximizes the browser window.
     */
    maximizeWindow(): TestControllerPromise;
    /**
     * Switches the test's browsing context to the specified `<iframe>`.
     *
     * @param selector - Identifies an `<iframe>` on the tested page.
     */
    switchToIframe(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;
    /**
     * Switches the test's browsing context from an `<iframe>` back to the main window.
     */
    switchToMainWindow(): TestControllerPromise;

    /**
     * Opens a new browser window.
     *
     * @param url - The URL to open. Can be local or remote, absolute or relative.
     */
    openWindow(url: string): WindowDescriptorPromise;

    /**
     * Closes a browser window.
     *
     * @param windowDescriptor - The target window. If this parameter is omitted, the currently active window is selected.
     */
    closeWindow(windowDescriptor?: WindowDescriptor): TestControllerPromise;

    /**
     * Retrieves a `window` object that corresponds to the currently open window.
     */
    getCurrentWindow(): WindowDescriptorPromise;

    /**
     * Activates the window that corresponds to the `window` object.
     *
     * @param windowDescriptor - The target window.
     */
    switchToWindow(windowDescriptor: WindowDescriptor): TestControllerPromise;

    /**
     * Activates the first window that matches the criteria passed to the `filterFn` function
     *
     * @param filterFn - The predicate used to select windows.
     */
    switchToWindow(filterFn: (data: WindowFilterData) => boolean): TestControllerPromise;

    /**
     * Activates the window that launched, or was active during the launch of, the currently active window.
     */
    switchToParentWindow(): TestControllerPromise;

    /**
     * Activates the most recent of the previously active windows.
     */
    switchToPreviousWindow(): TestControllerPromise;

    /**
     * Executes function on client and returns it's result.
     *
     * @param fn - A function to be executed on the client side.
     * @param options - Function options.
     */
    eval(fn: Function, options?: ClientFunctionOptions): Promise<any>;
    /**
     * Specifies handler function for the browser native dialogs.
     *
     * @param fn - A regular or client function that will be triggered whenever a native dialog is invoked. null to
     * remove the native dialog handler.
     * @param fn `type` - The type of the native dialog.
     * @param fn `text` - Text of the dialog message.
     * @param fn `url` - The URL of the page that invoked the dialog. Use it to determine if the dialog originated from
     * the main window or an `<iframe>`.
     * @param options - Handler options.
     */
    setNativeDialogHandler(fn: ((type: 'alert' | 'confirm' | 'beforeunload' | 'prompt', text: string, url: string) => any) | null,
                           options?: ClientFunctionOptions): TestControllerPromise;
    /**
     * Returns a stack of history entries (i.e., an array in which the latest dialog has an index of 0). Each entry
     * corresponds to a certain native dialog that appears in the main window or in an `<iframe>`.
     */
    getNativeDialogHistory(): Promise<NativeDialogHistoryItem[]>;
    /**
     * Returns an object that contains messages output to the browser console.
     */
    getBrowserConsoleMessages(): Promise<BrowserConsoleMessages>;
    /**
     * Starts an assertion chain and specifies assertion actual value.
     *
     * @param actual - An actual value of the assertion.
     */
    expect<A>(actual: A | Promise<A>): Assertion<A>;
    /**
     * Pauses the test and switches to the step-by-step execution mode.
     */
    debug(): TestControllerPromise;
    /**
     * Specifies the speed of test execution.
     *
     * @param speed - Specifies the test speed. Must be a number between 1 (the fastest) and 0.01 (the slowest).
     */
    setTestSpeed(speed: number): TestControllerPromise;
    /**
     * Specifies the amount of time within which TestCafe waits for the `window.load` event to fire before starting the test.
     *
     * @param duration - Specifies the amount of time within which TestCafe waits for the `window.load` event to fire before starting the test.
     */
    setPageLoadTimeout(duration: number): TestControllerPromise;
    /**
     * Switches user role.
     *
     * @param role - The role you need to use further in the test.
     */
    useRole(role: Role): TestControllerPromise;
    /**
     * Attaches the hooks during a test run
     *
     * @param hooks - The set of RequestHook subclasses
     */
    addRequestHooks(...hooks: object[]): TestControllerPromise;
    /**
     * Detaches the hooks during a test run
     *
     * @param hooks - The set of RequestHook subclasses
     */
    removeRequestHooks(...hooks: object[]): TestControllerPromise;
}

interface TestControllerPromise<T=any> extends TestController, Promise<T> {
}

interface WindowDescriptorPromise extends TestControllerPromise<WindowDescriptor> {
}

