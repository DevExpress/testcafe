import { Promise, nativeMethods } from './deps/hammerhead';
import { asyncServiceMsg } from './transport';
import noop from './utils/noop';
import * as COMMAND from '../../legacy/test-run/command';

const CHECK_FILE_DOWNLOADING_DELAY = 500;

var fileDownloadInterval = null;

function waitForFile () {
    return new Promise(resolve => {
        fileDownloadInterval = nativeMethods.setInterval.call(window, () => {
            asyncServiceMsg({ cmd: COMMAND.getAndUncheckFileDownloadingFlag }, res => {
                if (res) {
                    stopWaitingForFile();
                    resolve();
                }
            });
        }, CHECK_FILE_DOWNLOADING_DELAY);
    });
}

function stopWaitingForFile () {
    if (fileDownloadInterval) {
        nativeMethods.clearInterval.call(window, fileDownloadInterval);
        fileDownloadInterval = null;
    }
}

export function wait () {
    return waitForFile()
        .then(stopWaitingForFile)
        .catch(() => {
            stopWaitingForFile();

            return new Promise(noop);
        });
}
