import hammerhead from '../deps/hammerhead';

var Promise        = hammerhead.Promise;
var messageSandbox = hammerhead.eventSandbox.message;

export default function sendRequestToFrame (msg, responseCmd, receiverWindow) {
    return new Promise(resolve => {
        function onMessage (e) {
            if (e.message.cmd === responseCmd) {
                messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
                resolve(e.message);
            }
        }

        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
        messageSandbox.sendServiceMsg(msg, receiverWindow);
    });
}
