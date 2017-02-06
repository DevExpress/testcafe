// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export function createIntegerValidator (ErrorCtor) {
    return (name, val) => {
        var valType = typeof val;

        if (valType !== 'number')
            throw new ErrorCtor(name, valType);

        var isInteger = !isNaN(val) &&
                        isFinite(val) &&
                        val === Math.floor(val);

        if (!isInteger)
            throw new ErrorCtor(name, val);
    };
}

export function createPositiveIntegerValidator (ErrorCtor) {
    var integerValidator = createIntegerValidator(ErrorCtor);

    return (name, val) => {
        integerValidator(name, val);

        if (val < 0)
            throw new ErrorCtor(name, val);
    };
}

export function createBooleanValidator (ErrorCtor) {
    return (name, val) => {
        var valType = typeof val;

        if (valType !== 'boolean')
            throw new ErrorCtor(name, valType);
    };
}

export function createSpeedValidator (ErrorCtor) {
    return (name, val) => {
        var valType = typeof val;

        if (valType !== 'number')
            throw new ErrorCtor(name, valType);

        if (isNaN(val) || val < 0.01 || val > 1)
            throw new ErrorCtor(name, val);
    };
}
