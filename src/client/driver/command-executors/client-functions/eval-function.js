import { Promise, nativeMethods } from '../../deps/hammerhead';


// NOTE: evalFunction is isolated into a separate module to
// restrict access to TestCafe intrinsics for the evaluated code.
// It also accepts `__dependencies$` argument which may be used by evaluated code.
export default function evalFunction (fnCode, __dependencies$) {
    const evaluator = new nativeMethods.Function(
        'fnCode',
        '__dependencies$',
        'Promise',
        // NOTE: we should pass the original `RegExp`
        // to make the `instanceof RegExp` check successful in different contexts
        'RegExp',
        // NOTE: `eval` in strict mode will not override context variables
        '"use strict"; return eval(fnCode)'
    );

    return evaluator(fnCode, __dependencies$, Promise, RegExp);
}
