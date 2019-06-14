const EVAL_STACK_FRAME = /^\s+at eval \(.*<anonymous>/m;

export default {
    _getStack () {
        const error = new Error('');

        return error.stack;
    },

    isInRepl () {
        const stack = this._getStack();

        return EVAL_STACK_FRAME.test(stack);
    },

    get asyncMode () {
        return !this.isInRepl();
    }
}
