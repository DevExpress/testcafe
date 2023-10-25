import hammerhead from '../deps/hammerhead';
import * as eventUtils from '../utils/event';
import delay from '../utils/delay';
import MESSAGE from '../../../test-run/client-messages';

const Promise   = hammerhead.Promise;
const transport = hammerhead.transport;


const DEFAULT_BARRIER_TIMEOUT   = 400;
const FILE_DOWNLOAD_CHECK_DELAY = 500;
const MAX_UNLOADING_TIMEOUT     = 15_000;


let unloading = false;

let pageNavigationTriggeredListener = null as (() => void) | null;
let pageNavigationTriggered         = false;

function onBeforeUnload (): void {
    unloading = true;
}


function waitForFileDownload (): Promise<void> {
    return delay(FILE_DOWNLOAD_CHECK_DELAY)
        .then(() => transport.queuedAsyncServiceMsg({ cmd: MESSAGE.waitForFileDownload }))
        // eslint-disable-next-line consistent-return
        .then((fileDownloadingHandled: boolean): void | Promise<void> => {
            // NOTE: we use a flag to confirm file download because if unload
            // is raised the browser can respond with an empty string
            if (!fileDownloadingHandled)
                return new Promise(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
        });
}

// API
export function init (): void {
    hammerhead.on(hammerhead.EVENTS.beforeUnload, onBeforeUnload);

    eventUtils.bind(window, 'unload', () => {
        unloading = true;
    });
}

export function watchForPageNavigationTriggers (): void {
    pageNavigationTriggeredListener = () => {
        pageNavigationTriggered = true;
    };

    hammerhead.on(hammerhead.EVENTS.pageNavigationTriggered, pageNavigationTriggeredListener);
}

export function wait (timeout?: number): Promise<void> {
    if (timeout === void 0)
        timeout = !pageNavigationTriggeredListener || pageNavigationTriggered ? DEFAULT_BARRIER_TIMEOUT : 0;

    if (pageNavigationTriggeredListener) {
        hammerhead.off(hammerhead.EVENTS.pageNavigationTriggered, pageNavigationTriggeredListener);
        pageNavigationTriggeredListener = null;
    }

    const waitForUnloadingPromise = delay(timeout)
        .then((): void | Promise<void> => {
            if (!unloading)
                return void 0;

            return waitForFileDownload()
                .then(() => {
                    unloading = false;
                });

        });

    // NOTE: sometimes the page isn't actually unloaded after the beforeunload event
    // fires (see issues #664, #437). To avoid test hanging, we resolve the unload
    // barrier waiting promise in MAX_UNLOADING_TIMEOUT. We can improve this logic when
    // the https://github.com/DevExpress/testcafe-hammerhead/issues/667 issue is fixed.
    const watchdog = delay(MAX_UNLOADING_TIMEOUT)
        .then(() => {
            unloading = false;
        });

    return Promise.race([waitForUnloadingPromise, watchdog]);
}
