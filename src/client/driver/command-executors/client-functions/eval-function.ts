import { CommandExecutorsAdapterBase } from '../../../proxyless/command-executors-adapter-base';

// NOTE: evalFunction is isolated into a separate module to
// restrict access to TestCafe intrinsics for the evaluated code.
// It also accepts `__dependencies$` argument which may be used by evaluated code.
export default function evalFunction (fnCode: string, __dependencies$: unknown, adapter: CommandExecutorsAdapterBase): Function {
    const FunctionCtor = adapter.getNativeMethods().Function;

    if (adapter.isProxyless()) {
        const evaluator = new FunctionCtor(
            'fnCode',
            '__dependencies$',
            '"use strict"; return eval(fnCode)'
        );

        return evaluator(fnCode, __dependencies$);
    }

    const evaluator = new FunctionCtor(
        'fnCode',
        '__dependencies$',
        'Promise',
        // NOTE: we should pass the original `RegExp`
        // to make the `instanceof RegExp` check successful in different contexts
        'RegExp',
        // NOTE: `eval` in strict mode will not override context variables
        '"use strict"; return eval(fnCode)'
    );

    return evaluator(fnCode, __dependencies$, adapter.getPromiseCtor(), RegExp);
}
