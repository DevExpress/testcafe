
// {{#allowReferences}}
/// <reference path="../test-api/selector.d.ts" />
/// <reference path="../test-api/client-function.d.ts" />
// {{/allowReferences}}

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
