import { isValidDeviceName } from 'testcafe-browser-tools';
import roleMarkerSymbol from '../../../role/marker-symbol';

import {
    createBooleanValidator,
    createIntegerValidator,
    createPositiveIntegerValidator,
    createSpeedValidator
} from './factories';

import {
    ActionOptionsTypeError,
    ActionBooleanArgumentError,
    ActionStringArgumentError,
    ActionNullableStringArgumentError,
    ActionIntegerArgumentError,
    ActionRoleArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionStringOrStringArrayArgumentError,
    ActionStringArrayElementError,
    ActionUnsupportedDeviceTypeError,
    SetTestSpeedArgumentError
} from '../../../errors/test-run';

import { assertUrl } from '../../../api/test-page-url';


// Validators
export var integerArgument         = createIntegerValidator(ActionIntegerArgumentError);
export var positiveIntegerArgument = createPositiveIntegerValidator(ActionPositiveIntegerArgumentError);
export var booleanArgument         = createBooleanValidator(ActionBooleanArgumentError);
export var setSpeedArgument        = createSpeedValidator(SetTestSpeedArgumentError);


export function actionRoleArgument (name, val) {
    if (!val || !val[roleMarkerSymbol])
        throw new ActionRoleArgumentError(name, typeof val);
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

export function nullableStringArgument (argument, val) {
    var type = typeof val;

    if (type !== 'string' && val !== null)
        throw new ActionNullableStringArgumentError(argument, type);
}

export function urlArgument (name, val) {
    nonEmptyStringArgument(name, val);

    assertUrl(val.trim(), 'navigateTo');
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
