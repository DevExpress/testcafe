import baseGetOptions from './base';
import { Dictionary } from '../../configuration/interfaces';

export default async function (options: string): Promise<Dictionary<number | string | boolean>> {
    return baseGetOptions(options);
}
