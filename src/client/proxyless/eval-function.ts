const FunctionCtor = window.Function;

// NOTE: evalFunction is isolated into a separate module to
// restrict access to TestCafe intrinsics for the evaluated code.
// It also accepts `__dependencies$` argument which may be used by evaluated code.
export default function evalFunction (fnCode: string, __dependencies$: unknown): Function {
    const evaluator = new FunctionCtor(
        'fnCode',
        '__dependencies$',
        '"use strict"; return eval(fnCode)'
    );

    return evaluator(fnCode, __dependencies$);
}
