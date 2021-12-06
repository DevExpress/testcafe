import { isValidDeviceName } from 'device-specs';
import roleMarkerSymbol from '../../../role/marker-symbol';

import {
    createBooleanValidator,
    createIntegerValidator,
    createPositiveIntegerValidator,
    createSpeedValidator,
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
    ActionFunctionArgumentError,
    SetTestSpeedArgumentError,
    ForbiddenCharactersInScreenshotPathError,
    ActionCookieArgumentError,
    ActionCookieArgumentsError,
    ActionCookieArrayArgumentError,
    ActionCookieArrayArgumentsError,
    ActionNamesCookieArgumentError,
    ActionNamesArrayCookieArgumentError,
    ActionUrlsCookieArgumentError,
    ActionUrlsArrayCookieArgumentError,
    ActionNameValueObjectCookieArgumentError,
    ActionNameValueObjectsCookieArgumentError,
    ActionUrlTypeArgumentError,
    ActionUrlArgumentError,
} from '../../../errors/test-run';

import { URL } from 'url';
import { assertPageUrl } from '../../../api/test-page-url';
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

    assertPageUrl(val.trim(), 'navigateTo');
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

export function functionArgument (name, val) {
    if (typeof val !== 'function')
        throw new ActionFunctionArgumentError(name, val);
}

function isValidCookieToGetOrDelete (target) {
    return !!target && (typeof target.name === 'string' || typeof target.domain === 'string');
}

function isValidCookieToSet (target) {
    return !!target && (typeof target.name === 'string' && typeof target.domain === 'string' && typeof target.path === 'string');
}

function isValidNameValueCookie (target) {
    if (!target)
        return false;

    const targetEntries       = Object.keys(target);
    const targetEntriesLength = targetEntries.length;

    if (targetEntriesLength === 1) {
        const cookieValueType = typeof targetEntries[0];

        return cookieValueType === 'string';
    }

    return false;
}

function getCookieArgumentsValidationError (callsite, cookieArguments, validateFunction) {
    const cookieArgumentsLength = cookieArguments.length;

    for (const [cookieArgumentIndex, cookieArgument] of cookieArguments.entries()) {
        if (Array.isArray(cookieArgument)) {
            for (const [cookieElementIndex, cookieElement] of cookieArgument.entries()) {
                if (!validateFunction(cookieElement)) {
                    return cookieArgumentsLength === 1
                        ? new ActionCookieArrayArgumentError(callsite, cookieElementIndex)
                        : new ActionCookieArrayArgumentsError(callsite, cookieArgumentIndex, cookieElementIndex);
                }
            }
        }
        else if (!validateFunction(cookieArgument)) {
            return cookieArgumentsLength === 1
                ? new ActionCookieArgumentError(callsite)
                : new ActionCookieArgumentsError(callsite, cookieArgumentIndex);
        }
    }

    return null;
}

export function getCookieToGetOrDeleteArgumentsValidationError (callsite, cookieArguments) {
    return getCookieArgumentsValidationError(callsite, cookieArguments, isValidCookieToGetOrDelete);
}

export function getCookieToSetArgumentsValidationError (callsite, cookieArguments) {
    return getCookieArgumentsValidationError(callsite, cookieArguments, isValidCookieToSet);
}

export function namesCookieArgument (callsite, namesArgumentValue) {
    if (Array.isArray(namesArgumentValue)) {
        for (const [namesElementIndex, namesElement] of namesArgumentValue.entries()) {
            const namesElementType = typeof namesElement;

            if (namesElementType !== 'string')
                return new ActionNamesArrayCookieArgumentError(callsite, namesElementIndex, namesElementType);
        }
    }
    else {
        const namesArgumentType = typeof namesArgumentValue;

        if (namesArgumentType !== 'string')
            return new ActionNamesCookieArgumentError(callsite, namesArgumentType);
    }

    return null;
}

export function urlsCookieArgument (callsite, urlsArgumentValue) {
    if (Array.isArray(urlsArgumentValue)) {
        for (const [urlsElementIndex, urlsElement] of urlsArgumentValue.entries()) {
            const urlsElementType = typeof urlsElement;

            if (urlsElementType !== 'string')
                return new ActionUrlsArrayCookieArgumentError(callsite, urlsElementIndex, urlsElementType);
        }
    }
    else {
        const urlsArgumentType = typeof urlsArgumentValue;

        if (urlsArgumentType !== 'string')
            return new ActionUrlsCookieArgumentError(callsite, urlsArgumentType);
    }

    return null;
}

export function nameValueObjectsCookieArgument (callsite, nameValueObjectsArgumentValue) {
    if (Array.isArray(nameValueObjectsArgumentValue)) {
        for (const [nameValueElementIndex, nameValueElement] of nameValueObjectsArgumentValue.entries()) {
            if (!isValidNameValueCookie(nameValueElement))
                return new ActionNameValueObjectsCookieArgumentError(callsite, nameValueElementIndex);
        }
    }
    else if (!isValidNameValueCookie(nameValueObjectsArgumentValue))
        return new ActionNameValueObjectCookieArgumentError(callsite, nameValueObjectsArgumentValue);

    return null;
}

export function urlCookieArgument (callsite, urlArgumentValue) {
    const urlArgumentType = typeof urlArgumentValue;

    if (urlArgumentType !== 'string')
        return new ActionUrlTypeArgumentError(callsite, 'url', urlArgumentType);
    else if (!urlArgumentValue.length)
        return new ActionUrlTypeArgumentError(callsite, 'url', '""');

    try {
        new URL(urlArgumentValue); // eslint-disable-line no-new
    }
    catch {
        return new ActionUrlArgumentError(callsite, 'url');
    }

    return null;
}
