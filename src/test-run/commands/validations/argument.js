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

function isValidCookie (cookie) {
    return !!cookie && (!!cookie.name || !!cookie.domain && !!cookie.path);
}

export function cookiesArgument (name, val) {
    const cookiesLength = val.length;

    for (const [i, value] of val.entries()) {
        if (!isValidCookie(value)) {
            throw cookiesLength === 1
                ? new ActionCookieArgumentError()
                : new ActionCookieArgumentsError(i);
        }
    }
}

function isValidUrl (url) {
    try {
        return new URL(url) && true;
    }
    catch {
        return false;
    }
}

export function urlsArgument (name, val) {
    const cookiesLength = val.length;

    for (const [i, value] of val.entries()) {
        if (!isValidUrl(value)) {
            throw cookiesLength === 1
                ? new ActionUrlsCookieArgumentError()
                : new ActionUrlsArrayCookieArgumentError(i);
        }
    }
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

export function getCookieToSetArgumentsValidationError (callsite, cookieArguments) {
    return getCookieArgumentsValidationError(callsite, cookieArguments, isValidCookieToSet);
}

export function getNameValueObjectsCookieArgumentValidationError (callsite, nameValueObjectsArgumentValue) {
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

export function getUrlCookieArgumentValidationError (callsite, urlArgumentValue) {
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
