
// {{#allowReferences}}
/// <reference path="test-controller.d.ts" />
// {{/allowReferences}}

interface ClientFunctionOptions {
    /**
     *  Contains functions, variables or objects used by the client function internally.
     *  Properties of the `dependencies` object will be added to the client function's scope as variables.
     */
    dependencies?: {[key: string]: any};
    /**
     * If you need to call a client function from a Node.js callback, assign the current test controller to the `boundTestRun` option.
     */
    boundTestRun?: TestController;
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
