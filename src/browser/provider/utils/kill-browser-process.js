import { findProcess, killProcess } from '../../../utils/promisified-functions';


const BROWSER_CLOSING_TIMEOUT = 5;

export default async function (browserId) {
    var processOptions = { arguments: browserId };
    var processList = await findProcess(processOptions);

    if (!processList.length)
        return true;

    try {
        await killProcess(processList[0].pid, { timeout: BROWSER_CLOSING_TIMEOUT });

        return true;
    }
    catch (e) {
        return false;
    }
}
