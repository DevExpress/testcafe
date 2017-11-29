import { transport } from '../deps/hammerhead';
import { delay } from '../deps/testcafe-core';
import { hide as hideUI, show as showUI, showScreenshotMark, hideScreenshotMark } from '../deps/testcafe-ui';
import MESSAGE from '../../../test-run/client-messages';
import DriverStatus from '../status';


const POSSIBLE_RESIZE_ERROR_DELAY = 100;

export default function prepareBrowserManipulation (command) {
    var result = null;

    var message = {
        cmd:              MESSAGE.readyForBrowserManipulation,
        innerWidth:       window.innerWidth,
        innerHeight:      window.innerHeight,
        documentWidth:    document.documentElement.clientWidth,
        documentHeight:   document.documentElement.clientHeight,
        disableResending: true
    };

    hideUI();

    if (command.screenshotMarkData) {
        showScreenshotMark(command.screenshotMarkData);
        message.screenshotMarkSeed = command.screenshotMarkSeed;
    }

    return transport
        .queuedAsyncServiceMsg(message)
        .then(res => {
            result = res;

            if (command.screenshotMarkData)
                hideScreenshotMark();

            showUI();

            return delay(POSSIBLE_RESIZE_ERROR_DELAY);
        })
        .then(() => new DriverStatus({ isCommandResult: true, result }));
}
