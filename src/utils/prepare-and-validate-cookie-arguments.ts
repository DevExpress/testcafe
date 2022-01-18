import {
    ActionNoUrlForNameValueObjectsArgumentError,
    ActionRequiredSetCookieArgumentsAreMissedError,
} from '../errors/test-run';
import {
    getCookieToSetArgumentsValidationError,
    getNameValueObjectsCookieArgumentValidationError,
    getUrlCookieArgumentValidationError,
} from '../test-run/commands/validations/argument';
import {
    castArray,
    flatten,
} from 'lodash';
import { CallsiteRecord } from 'callsite-record';

interface CookieArgumentsToSet {
    cookies?: any[];
    nameValueObjects?: Record<string, string>[];
    url?: string;
}

export function prepareAndValidateCookieArgumentsToSet (callsite: CallsiteRecord, ...args: any[]): CookieArgumentsToSet {
    const result: CookieArgumentsToSet = {};

    if (args.length === 0)
        throw new ActionRequiredSetCookieArgumentsAreMissedError(callsite);

    const cookieArgumentsError = getCookieToSetArgumentsValidationError(callsite, args);

    if (args.length > 2) {
        if (cookieArgumentsError)
            throw cookieArgumentsError;

        result.cookies = flatten(args);
    }
    else if (args.length === 2) {
        if (cookieArgumentsError) {
            const nameValueArgumentError = getNameValueObjectsCookieArgumentValidationError(callsite, args[0]);
            const urlArgumentError       = getUrlCookieArgumentValidationError(callsite, args[1]);

            if (nameValueArgumentError)
                throw urlArgumentError ? cookieArgumentsError : nameValueArgumentError;
            else if (urlArgumentError)
                throw urlArgumentError;

            result.nameValueObjects = castArray(args[0]);
            result.url              = args[1];
        }
        else
            result.cookies = flatten(args);

    }
    else if (args.length === 1) {
        if (cookieArgumentsError) {
            const nameValueArgumentError = getNameValueObjectsCookieArgumentValidationError(callsite, args[0]);

            throw nameValueArgumentError ? cookieArgumentsError : new ActionNoUrlForNameValueObjectsArgumentError(callsite);
        }

        result.cookies = flatten(args);
    }

    return result;
}
