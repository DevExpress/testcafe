import debug from 'debug';
import log from './log';
import { SCREEN_RECORDING_PERMISSION_REQUEST } from '../notifications/information-message';
import CONSTANTS from '../configuration/constants';
import Timer from '../utils/timer';
import getAnyKey from '../utils/get-any-key';


const { MAX_AUTHENTICATION_DELAY } = CONSTANTS.CLI.AUTHENTICATION_HELPER;

const debugLog = debug('testcafe:cli:authentication-helper');

interface Action<T> {
    (): Promise<T>;
}

interface Constructor<C> {
    new (): C;
}

interface AuthenticationResult<T, E extends Error> {
    result?: T;
    error?: E;
}

async function checkAuthentication <T, E extends Error> (action: Action<T>, errorClass: Constructor<E>): Promise<AuthenticationResult<T, E>> {
    try {
        return { result: await action() };
    }
    catch (error) {
        if (!(error instanceof errorClass))
            throw error;

        return { error };
    }
}

export default async function authenticationHelper <T, E extends Error> (
    action: Action<T>,
    errorClass: Constructor<E>,
    { interactive = true } = {}
): Promise<AuthenticationResult<T, E>> {
    let { result, error } = await checkAuthentication(action, errorClass);

    const timer = new Timer(MAX_AUTHENTICATION_DELAY);

    while (error && !timer.expired && interactive) {
        debugLog(error);

        log.write(SCREEN_RECORDING_PERMISSION_REQUEST);

        await Promise.race([timer.promise, getAnyKey()]);

        ({ result, error } = await checkAuthentication(action, errorClass));
    }

    return { result, error };
}
