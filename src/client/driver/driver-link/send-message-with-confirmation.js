import { Promise, eventSandbox, nativeMethods } from '../deps/hammerhead';
import INTER_DRIVER_MESSAGES from './messages';
import generateId from '../generate-id';


const MIN_RESPONSE_WAITING_TIMEOUT = 2500;
const RESEND_MESSAGE_INTERVAL      = 1000;


export default function sendMessageWithConfirmation (msg, driverWindow, timeout, NotLoadedErrorCtor) {
    var sendMsgInterval = null;
    var sendMsgTimeout  = null;
    var onResponse      = null;

    var tearDown = () => {
        nativeMethods.clearInterval.call(window, sendMsgInterval);
        nativeMethods.clearTimeout.call(window, sendMsgTimeout);
        eventSandbox.message.off(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);
    };

    timeout = Math.max(timeout || 0, MIN_RESPONSE_WAITING_TIMEOUT);

    msg.requestId = generateId();

    return new Promise((resolve, reject) => {
        sendMsgTimeout = nativeMethods.setTimeout.call(window, () => {
            tearDown();
            reject(new NotLoadedErrorCtor());
        }, timeout);

        onResponse = e => {
            if (e.message.cmd === INTER_DRIVER_MESSAGES.confirmation && e.message.requestId === msg.requestId) {
                tearDown();
                resolve(e.message);
            }
        };

        eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);

        sendMsgInterval = nativeMethods.setInterval.call(window, () => eventSandbox.message.sendServiceMsg(msg, driverWindow), RESEND_MESSAGE_INTERVAL);
        eventSandbox.message.sendServiceMsg(msg, driverWindow);
    });
}
