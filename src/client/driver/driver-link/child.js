import { Promise, eventSandbox, nativeMethods } from '../deps/hammerhead';
import { domUtils, delay } from '../deps/testcafe-core';
import { CurrentIframeIsNotLoadedError, CurrentIframeNotFoundError, CurrentIframeIsInvisibleError } from '../../../errors/test-run';
import { ensureElementVisible } from '../ensure-element-utils';
import sendMessageWithConfirmation from './send-message-with-confirmation';
import INTER_DRIVER_MESSAGES from './messages';
import DriverStatus from '../status';


const CHECK_IFRAME_EXISTENCE_INTERVAL = 1000;
const WAIT_IFRAME_RESPONSE_DELAY      = 500;


export default class ChildDriverLink {
    constructor (driverWindow, driverId, iframeAvailabilityTimeout) {
        this.driverWindow              = driverWindow;
        this.driverIframe              = domUtils.findIframeByWindow(driverWindow);
        this.driverId                  = driverId;
        this.iframeAvailabilityTimeout = iframeAvailabilityTimeout;
    }

    _ensureIframe () {
        if (!domUtils.isElementInDocument(this.driverIframe))
            return Promise.reject(new CurrentIframeNotFoundError());

        return ensureElementVisible(this.driverIframe, this.iframeAvailabilityTimeout, () => new CurrentIframeIsInvisibleError());
    }

    _waitForIframeRemovedOrHidden () {
        return new Promise(resolve => {
            this.checkIframeInterval = nativeMethods.setInterval.call(window,
                () => this._ensureIframe().catch(resolve), CHECK_IFRAME_EXISTENCE_INTERVAL);
        });
    }

    _waitForCommandResult () {
        return new Promise(resolve => {
            var resolved = false;

            var onMessage = e => {
                var msg = e.message;

                /*eslint-disable no-use-before-define*/
                if (msg.cmd === INTER_DRIVER_MESSAGES.onCommandExecuted)
                    tearDownAndResolve(msg.status);
                /*eslint-enable no-use-before-define*/
            };

            var tearDownAndResolve = status => {
                if (resolved)
                    return;

                resolved = true;
                eventSandbox.message.off(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);
                nativeMethods.clearInterval.call(window, this.checkIframeInterval);

                resolve(status);
            };

            eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);

            // NOTE: If an iframe was removed or became hidden while a
            // command was being executed, we consider this command finished.
            this
                ._waitForIframeRemovedOrHidden()

                // NOTE: wait for possible delayed iframe message
                .then(() => delay(WAIT_IFRAME_RESPONSE_DELAY))
                .then(() => tearDownAndResolve(new DriverStatus({ isCommandResult: true })));
        });
    }

    confirmConnectionEstablished (requestMsg) {
        var msg = {
            cmd:       INTER_DRIVER_MESSAGES.confirmation,
            requestId: requestMsg.requestId,
            result:    { id: this.driverId }
        };

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }

    executeCommand (command) {
        // NOTE:  We should check if the iframe is visible and exists before executing the next
        // command, because the iframe might be hidden or removed since the previous command.
        return this
            ._ensureIframe()
            .then(() => {
                var msg = { cmd: INTER_DRIVER_MESSAGES.executeCommand, command };

                return Promise.all([
                    sendMessageWithConfirmation(msg, this.driverWindow, this.timeout, CurrentIframeIsNotLoadedError),
                    this._waitForCommandResult()
                ]);
            })
            .then(result => result[1]);
    }
}
