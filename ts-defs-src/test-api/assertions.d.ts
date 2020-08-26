
// {{#allowReferences}}
/// <reference path="utility.d.ts" />
/// <reference path="test-controller.d.ts" />
// {{/allowReferences}}

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
    typeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'regexp', message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is `typeName`.
     *
     * @param typeName - The expected type of an `actual` value.
     * @param options - Assertion options.
     */
    typeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'regexp', options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is not `typeName`.
     *
     * @param typeName - An unexpected type of an `actual` value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notTypeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'regexp', message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is not `typeName`.
     *
     * @param typeName - An unexpected type of an `actual` value.
     * @param options - Assertion options.
     */
    notTypeOf(typeName: 'function' | 'object' | 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'regexp', options?: AssertionOptions): TestControllerPromise;
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
