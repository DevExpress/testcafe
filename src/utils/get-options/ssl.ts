import os from 'os';
import debug from 'debug';
import baseGetOptions from './base';
import { GeneralError } from '../../errors/runtime';
import { stat, readFile } from '../promisified-functions';
import renderTemplate from '../../utils/render-template';
import { RUNTIME_ERRORS } from '../../errors/types';
import WARNING_MESSAGES from '../../notifications/warning-message';
import { Dictionary } from '../../configuration/interfaces';

const DEBUG_LOGGER = debug('testcafe:utils:get-options:ssl');

const MAX_PATH_LENGTH: Dictionary<number> = {
    'Linux':      4096,
    'Windows_NT': 260,
    'Darwin':     1024
};

const OS_MAX_PATH_LENGTH = MAX_PATH_LENGTH[os.type()];

const OPTIONS_SEPARATOR = ';';
const FILE_OPTION_NAMES = ['cert', 'key', 'pfx'];

export default async function (optionString: string): Promise<Dictionary<string | boolean | number>> {
    return baseGetOptions(optionString, {
        optionsSeparator: OPTIONS_SEPARATOR,

        async onOptionParsed (key: string, value: string) {
            if (!FILE_OPTION_NAMES.includes(key) || value.length > OS_MAX_PATH_LENGTH)
                return value;

            try {
                await stat(value);
            }
            catch (error) {
                DEBUG_LOGGER(renderTemplate(WARNING_MESSAGES.cannotFindSSLCertFile, value, key, error.stack));

                return value;
            }

            try {
                return await readFile(value);
            }
            catch (error) {
                throw new GeneralError(RUNTIME_ERRORS.cannotReadSSLCertFile, key, value, error.stack);
            }
        }
    });
}

