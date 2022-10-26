// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export function createIntegerValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'number')
            throw new ErrorCtor(name, valType);

        const isInteger = !isNaN(val) &&
                        isFinite(val) &&
                        val === Math.floor(val);

        if (!isInteger)
            throw new ErrorCtor(name, val);
    };
}

export function createPositiveIntegerValidator (ErrorCtor) {
    const integerValidator = createIntegerValidator(ErrorCtor);

    return (name, val) => {
        integerValidator(name, val);

        if (val < 0)
            throw new ErrorCtor(name, val);
    };
}

export function createBooleanValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'boolean')
            throw new ErrorCtor(name, valType);
    };
}

export function createSpeedValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'number')
            throw new ErrorCtor(name, valType);

        if (isNaN(val) || val < 0.01 || val > 1)
            throw new ErrorCtor(name, val);
    };
}

export function createStringValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'string')
            throw new ErrorCtor(name, valType);
    };
}
export function createStringOrRegexValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'string' && !(val instanceof RegExp))
            throw new ErrorCtor(name, valType);
    };
}

export function createDateValidator (ErrorCtor) {
    return (name, val) => {
        if (!(val instanceof Date))
            throw new ErrorCtor(name, val);
    };
}

export function createNumberValidator (ErrorCtor) {
    return (name, val) => {
        if (isNaN(Number(val)))
            throw new ErrorCtor(name, typeof val);
    };
}

export function createUrlValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'string' && !(val instanceof URL))
            throw new ErrorCtor(name, valType);
    };
}

export function createUrlSearchParamsValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'object' && !(val instanceof URLSearchParams))
            throw new ErrorCtor(name, valType);
    };
}

export function createObjectValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'object')
            throw new ErrorCtor(name, valType);
    };
}

export function createFunctionValidator (ErrorCtor) {
    return (name, val) => {
        const valType = typeof val;

        if (valType !== 'function')
            throw new ErrorCtor(name, valType);
    };
}
