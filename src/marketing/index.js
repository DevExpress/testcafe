import { EOL } from 'os';
import DataFile from './data-file';
import MESSAGES from './messages';
import getMessageIndex from './get-message-index';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';
import log from '../cli/log';
import debug from 'debug';

export const NUMBER_RUNS_BETWEEN_SHOW_MESSAGE = 10;

const DEBUG_LOGGER = debug('testcafe:marketing');

// For testing purposes
export const _dataFile = new DataFile();

export async function showMessageWithLinkToTestCafeStudio () {
    const data = await _dataFile.load();

    // NOTE: Don't show messages in case of the IO errors
    if (!data)
        return;

    data.runCount++;

    const shouldDisplayMessage = data.runCount === 1 || data.runCount % NUMBER_RUNS_BETWEEN_SHOW_MESSAGE === 0;

    if (shouldDisplayMessage) {
        const messageIndex = getMessageIndex(MESSAGES, data);
        const targetMsg    = MESSAGES[messageIndex];

        if (!targetMsg) {
            const message = renderTemplate(WARNING_MESSAGES.cannotCalculateMarketingMessage, messageIndex);

            DEBUG_LOGGER(message);
        }

        log.write(EOL + targetMsg);
    }

    await _dataFile.save(data);
}
