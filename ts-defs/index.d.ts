/// <reference types="node" />

declare module 'testcafe' {
    global {

        interface KeyModifiers {
            ctrl?: boolean;
            alt?: boolean;
            shift?: boolean;
            meta?: boolean
        }

        interface CropOptions {
            /**
             * The top edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
             * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
             */
            left?: number;
            /**
             * The left edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
             * If a negative number is passed, the coordinate is calculated from the element's right edge.
             */
            right?: number;
            /**
             * The bottom edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
             * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
             */
            top?: number;
            /**
             * The right edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
             * If a negative number is passed, the coordinate is calculated from the element's right edge.
             */
            bottom?: number;
        }

        interface ActionOptions {
            /**
             * The speed of action emulation. Defines how fast TestCafe performs the action when running tests.
             * A value between 1 (the maximum speed) and 0.01 (the minimum speed). If test speed is also specified in the CLI or
             * programmatically, the action speed setting overrides test speed. Default is 1.
             */
            speed?: number;
        }

        interface TakeScreenshotOptions {
            /**
             * Specifies the path where the screenshots are saved.
             */
            path?: string;
            /**
             * Specifies that TestCafe should take full-page screenshots.
             */
            fullPage?: boolean;
        }

        interface TakeElementScreenshotOptions extends ActionOptions {
            /**
             * Allows to crop the target element on the screenshot.
             */
            crop?: CropOptions;
            /**
             * Controls if element's margins should be included in the screenshot.
             * Set this property to `true` to include target element's margins in the screenshot.
             * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
             * the corners where top and left (or bottom and right) margins intersect
             */
            includeMargins?: boolean;
            /**
             * Controls if element's borders should be included in the screenshot.
             * Set this property to `true` to include target element's borders in the screenshot.
             * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
             * the corners where top and left (or bottom and right) internal edges of the element  intersect
             */
            includeBorders?: boolean;
            /**
             * Controls if element's paddings should be included in the screenshot.
             * Set this property to `true` to include target element's paddings in the screenshot.
             * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
             * the corners where top and left (or bottom and right) edges of the element's content area intersect
             */
            includePaddings?: boolean;
            /**
             * Specifies the X coordinate of the scrolling target point.
             * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
             * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
             * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
             * If the numbers are negative, the point is positioned relative to the bottom-right corner.
             * If the target element fits into the browser window, these properties have no effect.
             */
            scrollTargetX?: number;
            /**
             * Specifies the Y coordinate of the scrolling target point.
             * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
             * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
             * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
             * If the numbers are negative, the point is positioned relative to the bottom-right corner.
             * If the target element fits into the browser window, these properties have no effect.
             */
            scrollTargetY?: number;
        }

        interface MouseActionOptions extends ActionOptions {
            /**
             * Mouse pointer X coordinate that define a point where the action is performed or started.
             * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
             * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
             * The default is the center of the target element.
             */
            offsetX?: number;
            /**
             * Mouse pointer Y coordinate that define a point where the action is performed or started.
             * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
             * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
             * The default is the center of the target element.
             */
            offsetY?: number;
            /**
             * Indicate which modifier keys are to be pressed during the mouse action.
             */
            modifiers?: KeyModifiers;
        }

        interface ClickActionOptions extends MouseActionOptions {
            /**
             * The initial caret position if the action is performed on a text input field. A zero-based integer.
             * The default is the length of the input field content.
             */
            caretPos?: number;
        }

        interface TypeActionOptions extends ClickActionOptions {
            /**
             * `true` to remove the current text in the target element, and false to leave the text as it is.
             */
            replace?: boolean;
            /**
             * `true` to insert the entire block of current text in a single keystroke (similar to a copy & paste function),
             * and false to insert the current text character by character.
             */
            paste?: boolean;
        }

        interface DragToElementOptions extends MouseActionOptions {
            /**
             * Mouse pointer X coordinate that defines a point where the dragToElement action is finished.
             * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
             * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
             * By default, the dragToElement action is finished in the center of the destination element.
             */
            destinationOffsetX?: number;
            /**
             * Mouse pointer Y coordinate that defines a point where the dragToElement action is finished.
             * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
             * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
             * By default, the dragToElement action is finished in the center of the destination element.
             */
            destinationOffsetY?: number;
        }

        interface ResizeToFitDeviceOptions {
            /**
             * `true` for portrait screen orientation; `false` for landscape.
             */
            portraitOrientation?: boolean;
        }

        interface AssertionOptions {
            /**
             * The amount of time, in milliseconds, allowed for an assertion to pass before the test fails if a
             * selector property or a client function was used in assertion.
             */
            timeout?: number;
            /**
             * By default, a Promise is not allowed to be passed to an assertion unless it is a selector property
             * or the result of a client function. Setting this property to `true` overrides that default.
             */
            allowUnawaitedPromise?: boolean;
        }

        interface Assertion<E = any> {
            /**
             * Asserts that `actual` is deeply equal to `expected`.
             *
             * @param expected - An expected value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            eql(expected: E, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that actual is deeply equal to expected.
             *
             * @param expected - An expected value.
             * @param options - Assertion options.
             */
            eql(expected: E, options?: AssertionOptions): TestControllerPromise;
            /**
             * Assert that `actual` is not deeply equal to `unexpected`.
             *
             * @param unexpected - An unexpected value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notEql(unexpected: E, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Assert that `actual` is not deeply equal to `unexpected`.
             *
             * @param unexpected - An unexpected value.
             * @param options - Assertion options.
             */
            notEql(unexpected: E, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is truthy.
             *
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            ok(message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is truthy.
             *
             * @param options - Assertion options.
             */
            ok(options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is falsy.
             *
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notOk(message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is falsy.
             *
             * @param options - Assertion options.
             */
            notOk(options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` contains `expected`.
             *
             * @param expected - An expected value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            contains<R>(expected: EnsureString<E> | ElementOf<E> | Extend<E, R>, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` contains `expected`.
             *
             * @param expected - An expected value.
             * @param options - Assertion options.
             */
            contains<R>(expected: EnsureString<E> | ElementOf<E> | Extend<E, R>, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` not contains `unexpected`.
             *
             * @param unexpected - An unexpected value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notContains<R>(unexpected: EnsureString<E> | ElementOf<E> | Extend<E, R>, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` not contains `unexpected`.
             *
             * @param unexpected - An unexpected value.
             * @param options - Assertion options.
             */
            notContains<R>(unexpected: EnsureString<E> | ElementOf<E> | Extend<E, R>, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that type of `actual` is `typeName`.
             *
             * @param typeName - The expected type of an `actual` value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            typeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'regex', message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that type of `actual` is `typeName`.
             *
             * @param typeName - The expected type of an `actual` value.
             * @param options - Assertion options.
             */
            typeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'regex', options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that type of `actual` is not `typeName`.
             *
             * @param typeName - An unexpected type of an `actual` value.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notTypeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'regex', message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that type of `actual` is not `typeName`.
             *
             * @param typeName - An unexpected type of an `actual` value.
             * @param options - Assertion options.
             */
            notTypeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'regex', options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is strictly greater than `expected`.
             *
             * @param expected - A value that should be less than or equal to `actual`.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            gt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is strictly greater than `expected`.
             *
             * @param expected - A value that should be less than or equal to `actual`.
             * @param options - Assertion options.
             */
            gt(expected: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is greater than or equal to `expected`.
             *
             * @param expected - A value that should be less than `actual`.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            gte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is greater than or equal to `expected`.
             *
             * @param expected - A value that should be less than `actual`.
             * @param options - Assertion options.
             */
            gte(expected: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is less than `expected`.
             *
             * @param expected - A value that should be greater than or equal to `actual`.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            lt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is less than `expected`.
             *
             * @param expected - A value that should be greater than or equal to `actual`.
             * @param options - Assertion options.
             */
            lt(expected: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is less than or equal to `expected`.
             *
             * @param expected - A value that should be greater than `actual`.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            lte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is less than or equal to `expected`.
             *
             * @param expected - A value that should be greater than `actual`.
             * @param options - Assertion options.
             */
            lte(expected: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.
             *
             * @param start - A lower bound of range (included).
             * @param finish - An upper bound of range (included).
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            within(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.
             *
             * @param start - A lower bound of range (included).
             * @param finish - An upper bound of range (included).
             * @param options - Assertion options.
             */
            within(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.
             *
             * @param start - A lower bound of range (included).
             * @param finish - An upper bound of range (included).
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notWithin(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.
             *
             * @param start - A lower bound of range (included).
             * @param finish - An upper bound of range (included).
             * @param options - Assertion options.
             */
            notWithin(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` matches the regular expression.
             *
             * @param re - A regular expression that is expected to be matched.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            match(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` matches the regular expression.
             *
             * @param re - A regular expression that is expected to be matched.
             * @param options - Assertion options.
             */
            match(re: RegExp, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` does not match the regular expression.
             *
             * @param re - A regular expression that is expected to be matched.
             * @param message - An assertion message that will be displayed in the report if the test fails.
             * @param options - Assertion options.
             */
            notMatch(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
            /**
             * Asserts that `actual` does not match the regular expression.
             *
             * @param re - A regular expression that is expected to be matched.
             * @param options - Assertion options.
             */
            notMatch(re: RegExp, options?: AssertionOptions): TestControllerPromise;
        }

        interface ClientFunctionOptions {
            /**
             *  Contains functions, variables or objects used by the client function internally.
             *  Properties of the `dependencies` object will be added to the client function's scope as variables.
             */
            dependencies?: {[key: string]: any},
            /**
             * If you need to call a client function from a Node.js callback, assign the current test controller to the `boundTestRun` option.
             */
            boundTestRun?: TestController
        }

        interface ClientFunction<R = any, A extends any[]= any[]> {
            /**
             * Client function
             *
             * @param args - Function arguments.
             */
            (...args: A): Promise<R>;
            /**
             * Returns a new client function with a different set of options that includes options from the
             * original function and new `options` that overwrite the original ones.
             *
             * @param options - New options.
             */
            with(options: ClientFunctionOptions): ClientFunction<R, A>;
        }

        interface ClientFunctionFactory {
            <R, A extends any[]>(fn: (...args: A) => R, options?: ClientFunctionOptions): ClientFunction<R, A>
        }

        interface ClientScriptCommon {
            page?: any;
        }

        interface ClientScriptContent extends ClientScriptCommon {
            content?: string;
        }

        interface ClientScriptModule extends ClientScriptCommon {
            module?: string;
        }

        interface ClientScriptPath extends ClientScriptCommon {
            path?: string;
        }

        type ClientScript = ClientScriptContent | ClientScriptModule | ClientScriptPath;

        interface TextRectangle {
            /**
             * Y-coordinate, relative to the viewport origin, of the bottom of the rectangle box.
             */
            bottom: number;
            /**
             * X-coordinate, relative to the viewport origin, of the left of the rectangle box.
             */
            left: number;
            /**
             *    X-coordinate, relative to the viewport origin, of the right of the rectangle box.
             */
            right: number;
            /**
             * Y-coordinate, relative to the viewport origin, of the top of the rectangle box.
             */
            top: number;
            /**
             * Width of the rectangle box (This is identical to `right` minus `left`).
             */
            width: number;
            /**
             * Height of the rectangle box (This is identical to `bottom` minus `top`).
             */
            height: number;
        }

        interface NodeSnapshot {
            /**
             * The number of child HTML elements.
             */
            childElementCount: number;
            /**
             * The number of child nodes.
             */
            childNodeCount: number;
            /**
             * `true` if this node has child HTML elements.
             */
            hasChildElements: boolean;
            /**
             * `true` if this node has child nodes.
             */
            hasChildNodes: boolean;
            /**
             * The type of the node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
             */
            nodeType: number;
            /**
             * The text content of the node and its descendants.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
             */
            textContent: string;
            /**
             * Attributes of the element.
             */
            attributes?: {[name: string]: string};
            /**
             * The size of the element and its position relative to the viewport.
             */
            boundingClientRect?: TextRectangle;
            /**
             * For checkbox and radio input elements, their current state. For other elements, `undefined`.
             */
            checked?: boolean | undefined;
            /**
             * The list of element's classes.
             */
            classNames?: string[];
            /**
             * The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
             */
            clientHeight?: number;
            /**
             * The width of the left border of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
             */
            clientLeft?: number;
            /**
             * The width of the top border of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
             */
            clientTop?: number;
            /**
             * The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
             */
            clientWidth?: number;
            /**
             * `true` if the element is focused.
             */
            focused?: boolean;
            /**
             * The element's identifier.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
             */
            id?: string;
            /**
             * The element's text content "as rendered".
             * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
             */
            innerText?: string;
            /**
             * The namespace URI of the element. If the element does not have a namespace, this property is set to null.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
             */
            namespaceURI?: string | null;
            /**
             * The height of the element including vertical padding and borders.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
             */
            offsetHeight?: number;
            /**
             * The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
             */
            offsetLeft?: number;
            /**
             * The number of pixels that the upper left corner of the element is offset by to the top within the offsetParent node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
             */
            offsetTop?: number;
            /**
             * The width of the element including vertical padding and borders.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
             */
            offsetWidth?: number;
            /**
             * Indicates that `<option>` element is currently selected. For other elements, `undefined`.
             */
            selected?: boolean | undefined;
            /**
             *    For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
             */
            selectedIndex?: number | undefined;
            /**
             * The height of the element's content, including content not visible on the screen due to overflow.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
             */
            scrollHeight?: number;
            /**
             * The number of pixels that the element's content is scrolled to the left.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
             */
            scrollLeft?: number;
            /**
             * The number of pixels that the element's content is scrolled upward.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
             */
            scrollTop?: number;
            /**
             * Either the width in pixels of the element's content or the width of the element itself, whichever is greater.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
             */
            scrollWidth?: number;
            /**
             * The computed values of element's CSS properties.
             */
            style?: {[prop: string]: string};
            /**
             * The name of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
             */
            tagName?: string;
            /**
             * For input elements, the current value in the control. For other elements, `undefined`.
             */
            value?: string | undefined;
            /**
             * `true` if the element is visible.
             */
            visible?: boolean;
            /**
             * `true` if the element has the specified class name.
             *
             * @param className - Name of the class.
             */
            hasClass?(className: string): boolean;
            /**
             * Returns the computed value of the CSS property.
             *
             * @param propertyName - The name of the CSS property.
             */
            getStyleProperty?(propertyName: string): string;
            /**
             *    Returns the value of the attribute.
             *
             * @param attributeName - The name of the attribute.
             */
            getAttribute?(attributeName: string): string;
            /**
             * Returns the value of the property from the `boundingClientRect` object.
             *
             * @param propertyName - The name of the property.
             */
            getBoundingClientRectProperty?(propertyName: string): number;
            /**
             * `true` if the element has the attribute.
             *
             * @param attributeName - The name of the attribute.
             */
            hasAttribute?(attributeName: string): boolean;
        }

        // Request Hook
        //----------------------------------------------------------------------------------------------------------------------

        interface RequestHook {
            /**
             * The `onRequest` method is called before sending the request.
             */
            onRequest(requestEvent: object): Promise<void>;

            /**
             * The `onResponse` method is called after sending the request
             */
            onResponse(responseEvent: object): Promise<void>;
        }

        interface RequestHookConstructor {
            /**
             * Creates a request hook
             * @param requestFilterRules - determines which requests the hook handles
             * @param responseEventConfigureOpts - defines whether to pass the response headers and body to the onResponse method
             * @returns {RequestHook}
             */
            new (requestFilterRules?: Array<any>, responseEventConfigureOpts?: object): RequestHook;
        }

        // Request Logger
        //----------------------------------------------------------------------------------------------------------------------

        interface RequestLoggerOptions {
            /**
             *  Specifies whether the request headers should be logged.
             */
            logRequestHeaders?: boolean;
            /**
             * Specifies whether the request body should be logged.
             */
            logRequestBody?: boolean;
            /**
             * Specifies whether the request body should be stored as a String or a Buffer.
             */
            stringifyRequestBody?: boolean;
            /**
             * Specifies whether the response headers should be logged.
             */
            logResponseHeaders?: boolean;
            /**
             * Specifies whether the response body should be logged.
             */
            logResponseBody?: boolean;
            /**
             * Specifies whether the response body should be stored as a string or a Buffer.
             */
            stringifyResponseBody?: boolean;
        }

        interface LoggedRequest {
            /**
             * The user agent that sent the request.
             */
            userAgent: string;
            /**
             * The request part of the logged request
             */
            request: RequestData;
            /**
             * The response part of the logged request
             */
            response: ResponseData;
        }

        interface RequestData {
            /**
             * The URL where the request is sent.
             */
            url: string;
            /**
             * The request's HTTP method.
             */
            method: string;
            /**
             * Request headers in the property-value form. Logged if the `logRequestHeaders` option is set to `true`.
             */
            headers: object;
            /**
             * The response body. Logged if the `logResponseBody` option is set to `true`.
             * A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyResponseBody` option.
             */
            body: string | any;
            /**
             * The timestamp that specifies when the request was intercepted.
             */
            timestamp: number;
        }

        interface ResponseData {
            /**
             * The status code received in the response.
             */
            statusCode: number;
            /**
             * Response headers in the property-value form. Logged if the `logResponseHeaders` option is set to true.
             */
            headers: object;
            /**
             * The response body.
             * Logged if the `logResponseBody` option is set to true.
             * A Buffer or string depending on the `stringifyResponseBody` option.
             */
            body: string | any;
            /**
             * The timestamp that specifies when the response was intercepted.
             */
            timestamp: number;
        }

        interface RequestLogger extends RequestHook {
            /**
             * Returns whether the logger contains a request that matches the predicate.
             * @param predicate - The predicate
             */
            contains(predicate: (request: LoggedRequest) => boolean): Promise<boolean>;
            /**
             * Returns the number of requests that match the predicate.
             * @param predicate - The predicate
             */
            count(predicate: (request: LoggedRequest) => boolean): Promise<number>;
            /**
             * Clears all logged requests.
             */
            clear(): void;
            /**
             * Returns an array of logged requests.
             */
            requests: Array<LoggedRequest>;
        }

        interface RequestLoggerFactory {
            (
                filter?: string | RegExp | object | ((req: any) => boolean),
                options?: RequestLoggerOptions
            ): RequestLogger;
        }

        // Request Mock
        //----------------------------------------------------------------------------------------------------------------------

        interface RequestMock {
            /**
             * Specifies requests to intercept
             * @param filter - Specifies which requests should be mocked with a response that follows in the `respond` method.
             */
            onRequestTo(filter: string | RegExp | object | ((req: RequestOptions) => boolean)): RequestMock;
            /**
             * Specifies the mocked response.
             * @param body - The mocked response body.
             * @param statusCode - The response status code.
             * @param headers - Custom headers added to the response in the property-value form.
             */
            respond(body?: object | string | ((req: RequestOptions, res: ResponseMock) => any), statusCode?: number, headers?: object): RequestMock;
        }

        interface RequestMockFactory {
            (): RequestMock;
        }

        /**
         * {@link https://devexpress.github.io/testcafe/documentation/reference/test-api/requestmock/respond.html#requestoptions See documentation}.
         */
        interface RequestOptions {
            /** The request headers in the property-value form. */
            headers: Object;
            /** The request body. */
            body: Buffer;
            /** The URL to which the request is sent. */
            url: string;
            /** The protocol to use. Default: http:. */
            protocol: string;
            /** The alias for the host. */
            hostname: string;
            /** The domain name or IP address of the server to issue the request to. Default: localhost. */
            host: string;
            /** The port of the remote server. Default: 80. */
            port: number;
            /**
             * The request path. Should include query string if any. E.G. '/index.html?page=12'. An exception
             * is thrown when the request path contains illegal characters. Currently, only spaces are
             * rejected but that may change in the future. Default: '/'.
             */
            path: string;
            /** The string specifying the HTTP request method. Default: 'GET'. */
            method: string;
            /**
             * Credentials that were used for authentication in the current session using NTLM or Basic
             * authentication. For HTTP Basic authentication, these are `username` and `password`. NTLM
             * authentication additionally specifies `workstation` and `domain`.
             * See {@link https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/authentication.html#http-authentication HTTP Authentication}.
             */
            credentials: object;
            /**
             * If a proxy is used, the property contains information about its `host`, `hostname`, `port`,
             * `proxyAuth`, `authHeader` and `bypassRules`.
             */
            proxy: object;
        }

        interface ResponseMock {
            headers: object;
            statusCode: number;
            setBody(value: string): void;
        }

        interface Role {

        }

        interface RoleOptions {
            /**
             * Use this option to control which page is opened after you switch to the role.
             *
             * By default, TestCafe navigates back to the page that was opened previously to switching to the role.
             * Set the `preserveUrl` option to true to save the URL to which the browser was redirected after logging in.
             * TestCafe will navigate to the saved URL each time after you switch to this role.
             *
             * This option is useful if you store session-related data (like session ID) in the URL.
             */
            preserveUrl?: boolean;
        }

        interface RoleFactory {
            (url: String, fn: (t: TestController) => Promise<any>, options?: RoleOptions): Role;
            /**
             * Creates an anonymous user role.
             */
            anonymous(): Role;
        }

        interface SelectorOptions {
            /**
             * If you need to call a selector from a Node.js callback, assign the current test
             * controller to the `boundTestRun` option.
             */
            boundTestRun?: TestController;
            /**
             * The amount of time, in milliseconds, allowed for an element returned by the
             * selector to appear in the DOM before the test fails.
             */
            timeout?: number;
            /**
             * Use this option to pass functions, variables or objects to selectors initialized with a function.
             * The `dependencies` object's properties are added to the function's scope as variables.
             */
            dependencies?: {[key: string]: any};
            /**
             * `true` to additionally require the returned element to become visible within `options.timeout`.
             */
            visibilityCheck?: boolean;
        }

        interface SelectorAPI {
            /**
             * The number of child HTML elements.
             */
            childElementCount: Promise<number>;
            /**
             * The number of child nodes.
             */
            childNodeCount: Promise<number>;
            /**
             * `true` if this node has child HTML elements.
             */
            hasChildElements: Promise<boolean>;
            /**
             * `true` if this node has child nodes.
             */
            hasChildNodes: Promise<boolean>;
            /**
             * The type of the node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
             */
            nodeType: Promise<number>;
            /**
             * The text content of the node and its descendants.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
             */
            textContent: Promise<string>;
            /**
             * Attributes of the element.
             */
            attributes: Promise<{[name: string]: string}>;
            /**
             * The size of the element and its position relative to the viewport.
             */
            boundingClientRect: Promise<TextRectangle>;
            /**
             * For checkbox and radio input elements, their current state. For other elements, `undefined`.
             */
            checked: Promise<boolean | undefined>;
            /**
             * The list of element's classes.
             */
            classNames: Promise<string[]>;
            /**
             * The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
             */
            clientHeight: Promise<number>;
            /**
             * The width of the left border of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
             */
            clientLeft: Promise<number>;
            /**
             * The width of the top border of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
             */
            clientTop: Promise<number>;
            /**
             * The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
             */
            clientWidth: Promise<number>;
            /**
             * `true` if the element is focused.
             */
            focused: Promise<boolean>;
            /**
             * The element's identifier.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
             */
            id: Promise<string>;
            /**
             * The element's text content "as rendered".
             * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
             */
            innerText: Promise<string>;
            /**
             *    The namespace URI of the element. If the element does not have a namespace, this property is set to null.
             *    See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
             */
            namespaceURI: Promise<string | null>;
            /**
             * The height of the element including vertical padding and borders.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
             */
            offsetHeight: Promise<number>;
            /**
             * The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
             */
            offsetLeft: Promise<number>;
            /**
             * The number of pixels that the upper left corner of the element is offset by to the top within the offsetParent node.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
             */
            offsetTop: Promise<number>;
            /**
             * The width of the element including vertical padding and borders.
             * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
             */
            offsetWidth: Promise<number>;
            /**
             * Indicates that `<option>` element is currently selected. For other elements, `undefined`.
             */
            selected: Promise<boolean | undefined>;
            /**
             *    For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
             */
            selectedIndex: Promise<number | undefined>;
            /**
             * The height of the element's content, including content not visible on the screen due to overflow.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
             */
            scrollHeight: Promise<number>;
            /**
             * The number of pixels that the element's content is scrolled to the left.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
             */
            scrollLeft: Promise<number>;
            /**
             * The number of pixels that the element's content is scrolled upward.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
             */
            scrollTop: Promise<number>;
            /**
             * Either the width in pixels of the element's content or the width of the element itself, whichever is greater.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
             */
            scrollWidth: Promise<number>;
            /**
             * The computed values of element's CSS properties.
             */
            style: Promise<{[prop: string]: string}>;
            /**
             * The name of the element.
             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
             */
            tagName: Promise<string>;
            /**
             * For input elements, the current value in the control. For other elements, `undefined`.
             */
            value: Promise<string | undefined>;
            /**
             * `true` if the element is visible.
             */
            visible: Promise<boolean>;
            /**
             * `true` if the element has the specified class name.
             *
             * @param className - The name of the class.
             */
            hasClass(className: string): Promise<boolean>;
            /**
             * Returns the computed value of the CSS property.
             *
             * @param propertyName - The name of the CSS property.
             */
            getStyleProperty(propertyName: string): Promise<string>;
            /**
             *    Returns the value of the attribute.
             *
             * @param attributeName - The name of the attribute.
             */
            getAttribute(attributeName: string): Promise<string>;
            /**
             * Returns the value of the property from the `boundingClientRect` object.
             *
             * @param propertyName - The name of the property.
             */
            getBoundingClientRectProperty(propertyName: string): Promise<number>;
            /**
             * `true` if the element has the attribute.
             *
             * @param attributeName - The name of the attribute.
             */
            hasAttribute(attributeName: string): Promise<boolean>;
            /**
             * Creates a selector that returns an element by its index in the matching set.
             *
             * @param index - A zero-based index of the element. If negative, then counted from the end of the matching set.
             */
            nth(index: number): Selector;
            /**
             * Creates a selector that filters a matching set by the specified text.
             *
             * @param text - The text in the element.
             */
            withText(text: string): Selector;
            /**
             * Creates a selector that filters a matching set using the specified regular expression.
             *
             * @param re - The regular expression for the text in the element.
             */
            withText(re: RegExp): Selector;
            /**
             * Creates a selector that filters a matching set by the specified text. Selects elements whose text content *strictly matches* this text.
             *
             * @param text - The text in the element.
             */
            withExactText(text: string): Selector;
            /**
             * Creates a selector that filters a matching set by the specified attribute and, optionally, attribute value.
             *
             * @param attrName - The attribute name.
             * @param attrValue - The attribute value.You can omit this parameter to select elements that have
             * the `attrName` attribute regardless of the value.
             */
            withAttribute(attrName: string | RegExp, attrValue?: string | RegExp): Selector;
            /**
             * Creates a selector that filters a matching set by cssSelector.
             *
             * @param cssSelector - A CSS selector string.
             */
            filter(cssSelector: string): Selector;
            /**
             * Creates a selector that filters a matching set by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current DOM node.
             * @param filterFn `idx` - Index of the current node among other nodes in the matching set.
             * @param dependencies - Predicate dependencies.
             */
            filter(filterFn: (node: Element, idx: number) => boolean,
                   dependencies?: {[key: string]: any}): Selector;
            /**
             * Creates a selector that filters a matching set leaving only visible elements.
             */
            filterVisible(): Selector;
            /**
             * Creates a selector that filters a matching set leaving only hidden elements.
             */
            filterHidden(): Selector;
            /**
             * Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            find(cssSelector: string): Selector;
            /**
             * Finds all descendants of all nodes in the matching set and filters them using `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current descendant node.
             * @param filterFn `idx` - A zero-based index of `node` among other descendant nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set whose descendants are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            find(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                 dependencies?: {[key: string]: any}): Selector;
            /**
             * Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
             */
            parent(): Selector;
            /**
             * Finds all parents of all nodes in the matching set and filters them by `index`.
             *
             * @param index - A zero-based index of the parent (0 is the closest). If negative, then counted from the end of the matching set.
             */
            parent(index: number): Selector;
            /**
             * Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            parent(cssSelector: string): Selector;
            /**
             * Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current parent node.
             * @param filterFn `idx` - A zero-based index of `node` among other parent nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set whose parents are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            parent(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                   dependencies?: {[key: string]: any}): Selector;
            /**
             * Finds all child elements (not nodes) of all nodes in the matching set.
             */
            child(): Selector;
            /**
             * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`.
             *
             * @param index - A zero-based index of the child. If negative, then counted from the end of the matching set.
             */
            child(index: number): Selector;
            /**
             * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            child(cssSelector: string): Selector;
            /**
             * Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current child node.
             * @param filterFn `idx` - A zero-based index of `node` among other child nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set children parents are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            child(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                  dependencies?: {[key: string]: any}): Selector;
            /**
             * Finds all sibling elements (not nodes) of all nodes in the matching set.
             */
            sibling(): Selector;
            /**
             * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
             *
             * @param index -  a zero-based index of the sibling. If negative, then counted from the end of the matching set.
             */
            sibling(index: number): Selector;
            /**
             * nds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            sibling(cssSelector: string): Selector;
            /**
             * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current sibling node.
             * @param filterFn `idx` - A zero-based index of `node` among other sibling nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set whose siblings are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            sibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                    dependencies?: {[key: string]: any}): Selector;
            /**
             * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
             */
            nextSibling(): Selector;
            /**
             * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
             *
             * @param index - A zero-based index of the succeeding sibling. If negative, then counted from the end of the matching set.
             */
            nextSibling(index: number): Selector;
            /**
             * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            nextSibling(cssSelector: string): Selector;
            /**
             * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current succeeding sibling node.
             * @param filterFn `idx` - A zero-based index of `node` among other succeeding sibling nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set whose succeeding siblings are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            nextSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                        dependencies?: {[key: string]: any}): Selector;
            /**
             * Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
             */
            prevSibling(): Selector;
            /**
             *  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
             *
             * @param index - A zero-based index of the preceding sibling. If negative, then counted from the end of the matching set.
             */
            prevSibling(index: number): Selector;
            /**
             * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
             *
             * @param cssSelector - A CSS selector string.
             */
            prevSibling(cssSelector: string): Selector;
            /**
             * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
             *
             * @param filterFn - The predicate.
             * @param filterFn `node` - The current preceding sibling node.
             * @param filterFn `idx` - A zero-based index of `node` among other preceding sibling nodes.
             * @param filterFn `originNode` - A node from the left-hand selector's matching set whose preceding siblings are being iterated.
             * @param dependencies - Predicate dependencies.
             */
            prevSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                        dependencies?: {[key: string]: any}): Selector;
            /**
             * `true if` at least one matching element exists.
             */
            exists: Promise<boolean>;
            /**
             * The number of matching elements.
             */
            count: Promise<number>;
            /**
             *  Adds custom selector properties.
             *
             * @param props - Property descriptors.
             * @param props `prop` - Property name.
             * @param props `[prop]` - The function that calculate property values. Executed on the client side in the browser.
             * @param props `node` - The matching DOM node for which custom property is calculated.
             */
            addCustomDOMProperties(props: {[prop: string]: (node: Element) => any}): Selector;
            /**
             * Adds custom selector methods.
             *
             * @param methods - Method descriptors.
             * @param methods `method` - The method name.
             * @param methods `[method]` - The function that contains method code. Executed on the client side in the browser.
             * @param methods `node` - The matching DOM node for which custom method is executed.
             * @param methods `methodParams` - Custom method parameters.
             */
            addCustomMethods(methods: {[method: string]: (node: Element, ...methodParams: any[]) => any }, opts?: {returnDOMNodes?: boolean}): Selector;
            /**
             * Returns a new selector with a different set of options that includes options from the
             * original selector and new `options` that overwrite the original ones.
             *
             * @param options - New options.
             */
            with(options?: SelectorOptions): Selector;
        }

        interface Selector extends SelectorAPI {
            /**
             * Creates parametrized selector.
             *
             * @param args - Selector parameters.
             */
            (...args: any[]): SelectorPromise;
        }

        interface SelectorPromise extends SelectorAPI, Promise<NodeSnapshot> {
        }

        interface SelectorFactory {
            (
                init:
                    | string
                    | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)
                    | Selector
                    | NodeSnapshot
                    | SelectorPromise,
                options?: SelectorOptions
            ): Selector;
        }

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
            pressKey(keys: string, options?: ActionOptions): TestControllerPromise;
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
                                  options?: TakeElementScreenshotOptions): TestControllerPromise
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

        interface TestControllerPromise extends TestController, Promise<any> {
        }

        interface WindowDescriptorPromise extends TestController, Promise<WindowDescriptor> {
        }

        type ElementOf<T> = T extends (infer E)[] ? E : never;
        type Extend<T, E> = T extends E ? E : never;
        type EnsureString<T> = T extends string ? string : never;

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
             * Defines whether to enable the quarantine mode.
             */
            quarantineMode: boolean;
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
        }

        interface TestCafeFactory {
            (
                hostname?: string,
                port1?: number,
                port2?: number,
                sslOptions?: TlsOptions,
                developmentMode?: boolean
            ): Promise<TestCafe>;
        }
    }


    /**
     * Creates a selector.
     *
     * @param init - Selector initializer.
     * @param options - Selector options.
     */
    export const Selector: SelectorFactory;

    /**
     * Creates a client function.
     *
     * @param fn - Function code.
     * @param options - Function options.
     */
    export const ClientFunction: ClientFunctionFactory;

    /**
     * Creates a request mock
     */
    export const RequestMock: RequestMockFactory;

    /**
     * Creates a request logger
     */
    export const RequestLogger: RequestLoggerFactory;

    /** The RequestHook class used to create a custom HTTP request hook **/
    export const RequestHook: RequestHookConstructor;

    /**
     * Creates a user role.
     *
     * @param url - The URL of the login page.
     * @param fn - An asynchronous function that contains logic that authenticates the user.
     * @param fn `t` - The test controller used to access test run API.
     * @param options - Role options.
     */
    export const Role: RoleFactory;

    /**
     * The test controller used to access test run API.
     */
    export const t: TestController;

    const createTestCafe: TestCafeFactory;

    export default createTestCafe;
}



// 

declare const fixture: FixtureFn;
declare const test: TestFn;
