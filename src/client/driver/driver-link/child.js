import { Promise, eventSandbox, nativeMethods } from '../deps/hammerhead';
import { domUtils, delay, waitFor, positionUtils } from '../deps/testcafe-core';
import {
    CurrentIframeIsNotLoadedError,
    CurrentIframeNotFoundError,
    CurrentIframeIsInvisibleError
} from '../../../errors/test-run';
import sendMessageToDriver from './send-message-to-driver';
import { ExecuteCommandMessage, ConfirmationMessage, TYPE as MESSAGE_TYPE } from './messages';
import DriverStatus from '../status';


const CHECK_IFRAME_EXISTENCE_INTERVAL = 1000;
const CHECK_IFRAME_VISIBLE_INTERVAL   = 200;
const WAIT_IFRAME_RESPONSE_DELAY      = 500;


export default class ChildDriverLink {
    constructor (driverWindow, driverId) {
        this.driverWindow              = driverWindow;
        this.driverIframe              = domUtils.findIframeByWindow(driverWindow);
        this.driverId                  = driverId;
        this.iframeAvailabilityTimeout = 0;
    }

    set availabilityTimeout (val) {
        this.iframeAvailabilityTimeout = val;
    }

    _ensureIframe () {
        if (!domUtils.isElementInDocument(this.driverIframe))
            return Promise.reject(new CurrentIframeNotFoundError());

        return waitFor(() => positionUtils.isElementVisible(this.driverIframe) ? this.driverIframe : null,
            CHECK_IFRAME_VISIBLE_INTERVAL, this.iframeAvailabilityTimeout)
            .catch(() => {
                throw new CurrentIframeIsInvisibleError();
            });
    }

    _waitForIframeRemovedOrHidden () {
        // NOTE: If an iframe was removed or became hidden while a
        // command was being executed, we consider this command finished.
        return new Promise(resolve => {
            this.checkIframeInterval = nativeMethods.setInterval.call(window,
                () => {
                    this._ensureIframe()
                        .catch(() => {
                            // NOTE: wait for possible delayed iframe message
                            return delay(WAIT_IFRAME_RESPONSE_DELAY)
                                .then(() => resolve(new DriverStatus({ isCommandResult: true })));
                        });
                }, CHECK_IFRAME_EXISTENCE_INTERVAL);
        });
    }

    _waitForCommandResult () {
        var onMessage = null;

        var waitForResultMessage = () => new Promise(resolve => {
            onMessage = e => {
                if (e.message.type === MESSAGE_TYPE.commandExecuted)
                    resolve(e.message.driverStatus);
            };

            eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);
        });


        return Promise.race([this._waitForIframeRemovedOrHidden(), waitForResultMessage()])
            .then(status => {
                eventSandbox.message.off(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);
                nativeMethods.clearInterval.call(window, this.checkIframeInterval);

                return status;
            });
    }

    confirmConnectionEstablished (requestMsgId) {
        var msg = new ConfirmationMessage(requestMsgId, { id: this.driverId });

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }

    executeCommand (command, testSpeed) {
        // NOTE:  We should check if the iframe is visible and exists before executing the next
        // command, because the iframe might be hidden or removed since the previous command.
        return this
            ._ensureIframe()
            .then(() => {
                var msg = new ExecuteCommandMessage(command, testSpeed);

                return Promise.all([
                    sendMessageToDriver(msg, this.driverWindow, this.iframeAvailabilityTimeout, CurrentIframeIsNotLoadedError),
                    this._waitForCommandResult()
                ]);
            })
            .then(result => result[1]);
    }
}
