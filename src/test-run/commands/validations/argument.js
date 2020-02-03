import { isValidDeviceName } from 'device-specs';
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
    SetTestSpeedArgumentError,
    ForbiddenCharactersInScreenshotPathError
} from '../../../errors/test-run';

import { assertUrl } from '../../../api/test-page-url';
import checkFilePath from '../../../utils/check-file-path';


// Validators
export const integerArgument         = createIntegerValidator(ActionIntegerArgumentError);
export const positiveIntegerArgument = createPositiveIntegerValidator(ActionPositiveIntegerArgumentError);
export const booleanArgument         = createBooleanValidator(ActionBooleanArgumentError);
export const setSpeedArgument        = createSpeedValidator(SetTestSpeedArgumentError);


export function actionRoleArgument (name, val) {
    if (!val || !val[roleMarkerSymbol])
        throw new ActionRoleArgumentError(name, typeof val);
}

export function actionOptions (name, val) {
    const type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
}


export function stringArgument (argument, val, createError) {
    if (!createError)
        createError = actualValue => new ActionStringArgumentError(argument, actualValue);

    const type = typeof val;

    if (type !== 'string')
        throw createError(type);
}

export function nonEmptyStringArgument (argument, val, createError) {
    if (!createError)
        createError = actualValue => new ActionStringArgumentError(argument, actualValue);

    stringArgument(argument, val, createError);

    if (!val.length)
        throw createError('""');
}

export function nullableStringArgument (argument, val) {
    const type = typeof val;

    if (type !== 'string' && val !== null)
        throw new ActionNullableStringArgumentError(argument, type);
}

export function urlArgument (name, val) {
    nonEmptyStringArgument(name, val);

    assertUrl(val.trim(), 'navigateTo');
}

export function stringOrStringArrayArgument (argument, val) {
    const type = typeof val;

    if (type === 'string') {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '""');
    }

    else if (Array.isArray(val)) {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '[]');

        const validateElement = elementIndex => nonEmptyStringArgument(
            argument,
            val[elementIndex],
            actualValue => new ActionStringArrayElementError(argument, actualValue, elementIndex)
        );

        for (let i = 0; i < val.length; i++)
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

export function screenshotPathArgument (name, val) {
    nonEmptyStringArgument(name, val);

    const forbiddenCharsList = checkFilePath(val);

    if (forbiddenCharsList.length)
        throw new ForbiddenCharactersInScreenshotPathError(val, forbiddenCharsList);
}
