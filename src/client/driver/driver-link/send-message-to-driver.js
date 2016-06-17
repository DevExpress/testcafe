import { Promise, eventSandbox, nativeMethods } from '../deps/hammerhead';
import { delay } from '../deps/testcafe-core';
import { TYPE as MESSAGE_TYPE } from './messages';


const MIN_RESPONSE_WAITING_TIMEOUT = 2500;
const RESEND_MESSAGE_INTERVAL      = 1000;


export default function sendMessageToDriver (msg, driverWindow, timeout, NotLoadedErrorCtor) {
    var sendMsgInterval = null;
    var sendMsgTimeout  = null;
    var onResponse      = null;

    timeout = Math.max(timeout || 0, MIN_RESPONSE_WAITING_TIMEOUT);

    var sendAndWaitForResponse = () => {
        return new Promise(resolve => {
            onResponse = e => {
                if (e.message.type === MESSAGE_TYPE.confirmation && e.message.requestMessageId === msg.id)
                    resolve(e.message);
            };

            eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);

            sendMsgInterval = nativeMethods.setInterval.call(window, () => eventSandbox.message.sendServiceMsg(msg, driverWindow), RESEND_MESSAGE_INTERVAL);
            eventSandbox.message.sendServiceMsg(msg, driverWindow);
        });
    };

    return Promise.race([delay(timeout), sendAndWaitForResponse()])
        .then(response => {
            nativeMethods.clearInterval.call(window, sendMsgInterval);
            nativeMethods.clearTimeout.call(window, sendMsgTimeout);
            eventSandbox.message.off(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);

            if (!response)
                throw new NotLoadedErrorCtor();

            return response;
        });
}
