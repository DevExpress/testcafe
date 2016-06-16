import { isValidDeviceName } from 'testcafe-browser-natives';

import {
    createBooleanValidator,
    createIntegerValidator,
    createPositiveIntegerValidator
} from './factories';

import {
    ActionSelectorTypeError,
    ActionOptionsTypeError,
    ActionBooleanArgumentError,
    ActionStringArgumentError,
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionAdditionalSelectorTypeError,
    ActionUnsupportedUrlProtocolError,
    ActionStringOrStringArrayArgumentError,
    ActionStringArrayElementError,
    ActionUnsupportedDeviceTypeError
} from '../../../errors/test-run';


const PROTOCOL_RE           = /^([\w-]+?)(?=\:)/;
const SUPPORTED_PROTOCOL_RE = /^https?/i;

// Validators
export var integerArgument         = createIntegerValidator(ActionIntegerArgumentError);
export var positiveIntegerArgument = createPositiveIntegerValidator(ActionPositiveIntegerArgumentError);
export var booleanArgument         = createBooleanValidator(ActionBooleanArgumentError);


export function selector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionSelectorTypeError(type);
}

export function additionalSelector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionAdditionalSelectorTypeError(name, type);
}

export function actionOptions (name, val) {
    var type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
}


export function nonEmptyStringArgument (argument, val, createError) {
    if (!createError)
        createError = actualValue => new ActionStringArgumentError(argument, actualValue);

    var type = typeof val;

    if (type !== 'string')
        throw createError(type);

    if (!val.length)
        throw createError('""');
}

export function urlArgument (name, val) {
    nonEmptyStringArgument(name, val);

    var url      = val.trim();
    var protocol = url.match(PROTOCOL_RE);

    if (protocol && !SUPPORTED_PROTOCOL_RE.test(protocol[0]))
        throw new ActionUnsupportedUrlProtocolError(name, protocol[0]);
}

export function stringOrStringArrayArgument (argument, val) {
    var type = typeof val;

    if (type === 'string') {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '""');
    }

    else if (Array.isArray(val)) {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '[]');

        var validateElement = elementIndex => nonEmptyStringArgument(
            argument,
            val[elementIndex],
            actualValue => new ActionStringArrayElementError(argument, actualValue, elementIndex)
        );

        for (var i = 0; i < val.length; i++)
            validateElement(i);
    }

    else
        throw new ActionStringOrStringArrayArgumentError(argument, type);
}

export function resizeWindowDeviceArgument (name, val) {
    nonEmptyStringArgument(name, val);

    if (!isValidDeviceName(val))
        throw new ActionUnsupportedDeviceTypeError(name, val);
}
