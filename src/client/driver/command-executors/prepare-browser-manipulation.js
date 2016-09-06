import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import MESSAGE from '../../../test-run/client-messages';
import DriverStatus from '../status';

var nativeMethods = hammerhead.nativeMethods;
var transport     = hammerhead.transport;
var delay         = testCafeCore.delay;

const CHECK_TITLE_INTERVAL           = 50;
const APPLY_DOCUMENT_TITLE_TIMEOUT   = 500;
const RESTORE_DOCUMENT_TITLE_TIMEOUT = 100;


export default function prepareBrowserManipulation (browserId) {
    var savedDocumentTitle   = document.title;
    var assignedTitle        = `[ ${browserId} ]`;
    var checkTitleIntervalId = null;
    var result               = null;

    // NOTE: we should keep the page url in document.title
    // while the browser manipulation is in progress.
    checkTitleIntervalId = nativeMethods.setInterval.call(window, () => {
        if (document.title !== assignedTitle) {
            savedDocumentTitle = document.title;
            document.title     = assignedTitle;
        }
    }, CHECK_TITLE_INTERVAL);

    document.title = assignedTitle;

    return delay(APPLY_DOCUMENT_TITLE_TIMEOUT)
        .then(() => {
            var message = {
                cmd:              MESSAGE.readyForBrowserManipulation,
                innerWidth:       window.innerWidth,
                innerHeight:      window.innerHeight,
                disableResending: true
            };

            return transport.queuedAsyncServiceMsg(message);
        })
        .then(res => {
            result = res;
            nativeMethods.clearInterval.call(window, checkTitleIntervalId);
            document.title = savedDocumentTitle;

            return delay(RESTORE_DOCUMENT_TITLE_TIMEOUT);
        })
        .then(() => new DriverStatus({ isCommandResult: true, result }));
}
