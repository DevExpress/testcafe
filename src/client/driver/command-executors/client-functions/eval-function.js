import { Promise, nativeMethods } from '../../deps/hammerhead';


// NOTE: evalFunction is isolated into a separate module to
// restrict access to TestCafe intrinsics for the evaluated code.
// It also accepts `__dependencies$` argument which may be used by evaluated code.
/* eslint-disable @typescript-eslint/no-unused-vars */
export default function evalFunction (fnCode, __dependencies$) {
    // NOTE: `eval` in strict mode will not override context variables
    const evaluator = new nativeMethods.Function('fnCode', '__dependencies$', 'Promise', '"use strict"; return eval(fnCode)');

    return evaluator(fnCode, __dependencies$, Promise);
}
/* eslint-enable @typescript-eslint/no-unused-vars */
