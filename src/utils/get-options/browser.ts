import { RUNTIME_ERRORS } from '../../errors/types';
import BrowserConnection, { BrowserInfo } from '../../browser/connection';
import browserProviderPool from '../../browser/provider/pool';
import { flatten } from 'lodash';
import { GeneralError } from '../../errors/runtime';

type BrowserInfoSource = BrowserInfo | BrowserConnection;

type BrowserSource = BrowserConnection | BrowserInfo | string;

export default async function (browsers: BrowserSource[]): Promise<BrowserInfoSource[]> {

    if (!browsers.length)
        throw new GeneralError(RUNTIME_ERRORS.browserNotSet);

    const browserInfo = await Promise.all(browsers.map(browser => {
        return (browser as BrowserInfo)['alias'] && browser ||
               browserProviderPool.getBrowserInfo(browser);
    }));

    return flatten(browserInfo);
}
