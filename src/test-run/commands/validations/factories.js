// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

function numberValidator (name, val, ErrorCtor) {
    var valType = typeof val;

    if (valType !== 'number')
        throw new ErrorCtor(name, valType);

    if (isNaN(val) && !isFinite(val))
        throw new ErrorCtor(name, val);
}

export function createIntegerValidator (ErrorCtor) {
    return (name, val) => {
        numberValidator(name, val, ErrorCtor);

        if (val !== Math.floor(val))
            throw new ErrorCtor(name, val);
    };
}

export function createNumberValidator (ErrorCtor) {
    return (name, val) => {
        numberValidator(name, val, ErrorCtor);
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
