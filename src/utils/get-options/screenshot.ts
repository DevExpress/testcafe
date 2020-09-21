import baseGetOptions from './base';
import SCREENSHOT_OPTION_NAMES from '../../configuration/screenshot-option-names';
import { Dictionary } from '../../configuration/interfaces';


function isScreenshotOption (option: string): option is SCREENSHOT_OPTION_NAMES {
    return Object.values(SCREENSHOT_OPTION_NAMES).includes(option as SCREENSHOT_OPTION_NAMES);
}

export default async function (options: string | Dictionary<string | number | boolean>): Promise<Dictionary<number | string | boolean>> {
    const parsedOptions = await baseGetOptions(options);

    if (typeof options === 'string' && Object.keys(parsedOptions).some(key => !isScreenshotOption(key)))
        return { path: options };

    return parsedOptions;
}
