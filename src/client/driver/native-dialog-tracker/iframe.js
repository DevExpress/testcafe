import hammerhead from '../deps/hammerhead';
import MESSAGE_TYPE from './messages';
import NativeDialogTracker from './index';

var messageSandbox = hammerhead.eventSandbox.message;


export default class IframeNativeDialogTracker extends NativeDialogTracker {
    constructor (dialogHandler) {
        super(null, dialogHandler);
    }

    _defaultDialogHandler (type) {
        messageSandbox.sendServiceMsg({
            type:       MESSAGE_TYPE.unexpectedDialog,
            dialogType: type
        }, window.top);
    }

    _addAppearedDialogs (type, text) {
        messageSandbox.sendServiceMsg({
            type:       MESSAGE_TYPE.appearedDialog,
            dialogType: type,
            text:       text
        }, window.top);
    }

    _onHandlerError (type, message) {
        messageSandbox.sendServiceMsg({
            type:       MESSAGE_TYPE.handlerError,
            dialogType: type,
            message
        }, window.top);
    }
}
