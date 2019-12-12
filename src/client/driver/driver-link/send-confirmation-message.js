import { ConfirmationMessage } from './messages';
import { eventSandbox } from '../deps/hammerhead';

export default function ({ requestMsgId, result, window }) {
    const msg = new ConfirmationMessage(requestMsgId, result);

    eventSandbox.message.sendServiceMsg(msg, window);
}
