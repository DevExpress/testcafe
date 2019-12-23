const EVAL_STACK_FRAME = /^\s+at eval \(.*<anonymous>/m;

export default function (): boolean {
    const error = new Error('');

    if (!error.stack)
        return false;

    return EVAL_STACK_FRAME.test(error.stack);
}
