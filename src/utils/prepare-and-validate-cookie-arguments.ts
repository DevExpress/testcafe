import {
    ActionNoUrlForNameValueObjectsArgumentError,
    ActionRequiredSetCookieArgumentsAreMissedError,
} from '../errors/test-run';
import {
    getCookieToGetOrDeleteArgumentsValidationError,
    getCookieToSetArgumentsValidationError,
    getNamesCookieArgumentValidationError,
    getNameValueObjectsCookieArgumentValidationError,
    getUrlCookieArgumentValidationError,
    getUrlsCookieArgumentValidationError,
} from '../test-run/commands/validations/argument';
import {
    castArray,
    flatten,
} from 'lodash';
import { CallsiteRecord } from 'callsite-record';

interface CookieArgumentsToGetOrDelete {
    cookies: any[] | undefined;
    names: string[] | undefined;
    urls: string[] | undefined;
}

interface CookieArgumentsToSet {
    cookies: any[] | undefined;
    nameValueObjects: Record<string, string>[] | undefined;
    url: string | undefined;
}

export function prepareAndValidateCookieArgumentsToGetOrDelete (callsite: CallsiteRecord, ...args: any[]): CookieArgumentsToGetOrDelete {
    let cookies: any[] | undefined = void 0;

    let names: string[] | undefined = void 0;
    let urls: string[] | undefined  = void 0;

    if (args.length === 0)
        return { cookies, names, urls };

    const cookieArgumentsError = getCookieToGetOrDeleteArgumentsValidationError(callsite, args);

    if (args.length > 2) {
        if (cookieArgumentsError)
            throw cookieArgumentsError;

        cookies = flatten(args);
    }
    else if (args.length === 2) {
        if (cookieArgumentsError) {
            const namesArgumentError = getNamesCookieArgumentValidationError(callsite, args[0]);
            const urlsArgumentError  = getUrlsCookieArgumentValidationError(callsite, args[1]);

            if (namesArgumentError)
                throw urlsArgumentError ? cookieArgumentsError : namesArgumentError;
            else if (urlsArgumentError)
                throw urlsArgumentError;

            names = castArray(args[0]);
            urls  = castArray(args[1]);
        }
        else
            cookies = flatten(args);
    }
    else if (args.length === 1) {
        if (cookieArgumentsError) {
            const namesArgumentError = getNamesCookieArgumentValidationError(callsite, args[0]);

            if (namesArgumentError)
                throw cookieArgumentsError;

            names = castArray(args[0]);
        }
        else
            cookies = flatten(args);
    }

    return { cookies, names, urls };
}

export function prepareAndValidateCookieArgumentsToSet (callsite: CallsiteRecord, ...args: any[]): CookieArgumentsToSet {
    let cookies: any[] | undefined = void 0;

    let nameValueObjects: Record<string, string>[] | undefined = void 0;
    let url: string | undefined                                = void 0;

    if (args.length === 0)
        throw new ActionRequiredSetCookieArgumentsAreMissedError(callsite);

    const cookieArgumentsError = getCookieToSetArgumentsValidationError(callsite, args);

    if (args.length > 2) {
        if (cookieArgumentsError)
            throw cookieArgumentsError;

        cookies = flatten(args);
    }
    else if (args.length === 2) {
        if (cookieArgumentsError) {
            const nameValueArgumentError = getNameValueObjectsCookieArgumentValidationError(callsite, args[0]);
            const urlArgumentError       = getUrlCookieArgumentValidationError(callsite, args[1]);

            if (nameValueArgumentError)
                throw urlArgumentError ? cookieArgumentsError : nameValueArgumentError;
            else if (urlArgumentError)
                throw urlArgumentError;

            nameValueObjects = castArray(args[0]);
            url              = args[1];
        }
        else
            cookies = flatten(args);

    }
    else if (args.length === 1) {
        if (cookieArgumentsError) {
            const nameValueArgumentError = getNameValueObjectsCookieArgumentValidationError(callsite, args[0]);

            throw nameValueArgumentError ? cookieArgumentsError : new ActionNoUrlForNameValueObjectsArgumentError(callsite);
        }

        cookies = flatten(args);
    }

    return { cookies, nameValueObjects, url };
}
