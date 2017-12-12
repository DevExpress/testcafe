import { transport } from '../deps/hammerhead';
import { delay } from '../deps/testcafe-core';
import { hide as hideUI, show as showUI, showScreenshotMark, hideScreenshotMark } from '../deps/testcafe-ui';
import MESSAGE from '../../../test-run/client-messages';
import DriverStatus from '../status';


const POSSIBLE_RESIZE_ERROR_DELAY = 100;

export default function prepareBrowserManipulation (command, element) {
    var result = null;

    var message = {
        cmd:              MESSAGE.readyForBrowserManipulation,
        innerWidth:       window.innerWidth,
        innerHeight:      window.innerHeight,
        documentWidth:    document.documentElement.clientWidth,
        documentHeight:   document.documentElement.clientHeight,
        disableResending: true
    };

    if (element) {
        var { top, left, bottom, right } = element.getBoundingClientRect();

        message.elementRect = { top, left, bottom, right };

        var { cropX, cropY, cropWidth, cropHeight, offsetX, offsetY } = command.options;

        message.cropDimensions = { cropX, cropY, cropWidth, cropHeight, offsetX, offsetY };
    }

    hideUI();

    var { screenshotMarkData } = command.options || {};

    if (screenshotMarkData)
        showScreenshotMark(screenshotMarkData);

    return transport
        .queuedAsyncServiceMsg(message)
        .then(res => {
            result = res;

            if (screenshotMarkData)
                hideScreenshotMark();

            showUI();

            return delay(POSSIBLE_RESIZE_ERROR_DELAY);
        })
        .then(() => new DriverStatus({ isCommandResult: true, result }));
}
