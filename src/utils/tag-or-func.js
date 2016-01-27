export default function (fn) {
    return function (arg) {
        if (Array.isArray(arg) && Array.isArray(arg.raw))
            arg = String.raw.apply(null, arguments);

        return fn.call(this, arg);
    };
}
