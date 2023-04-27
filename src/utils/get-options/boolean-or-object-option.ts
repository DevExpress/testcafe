import baseGetOptions from './base';
import convertToBestFitType from '../convert-to-best-fit-type';
import { Dictionary, GetOptionConfiguration } from '../../configuration/interfaces';

type BooleanOrObjectOption<T> = boolean | Dictionary<T>
type ValidationFunction<T> = (opts: Dictionary<T>) => void | Promise<void>;

export async function getBooleanOrObjectOption<T> (optionName: string, options: boolean | string | Dictionary<any>, optionsConfig: GetOptionConfiguration, validator: ValidationFunction<T>): Promise<BooleanOrObjectOption<T>> {
    options = convertToBestFitType(options);

    if (typeof options === 'boolean')
        return options;

    const parsedOptions = await baseGetOptions(options as string, optionsConfig);

    await validator(parsedOptions);

    return parsedOptions;
}
