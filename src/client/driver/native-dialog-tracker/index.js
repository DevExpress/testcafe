import hammerhead from '../deps/hammerhead';
import { NativeDialogNotHandledError, UncaughtErrorInNativeDialogHandler } from '../../../errors/test-run';
import ClientFunctionExecutor from '../command-executors/client-functions/client-function-executor';
import MESSAGE_TYPE from './messages';


var messageSandbox = hammerhead.eventSandbox.message;
var processScript  = hammerhead.processScript;
var nativeMethods  = hammerhead.nativeMethods;

const APPEARED_DIALOGS                  = 'testcafe|native-dialog-tracker|appeared-dialogs';
const UNEXPECTED_DIALOG                 = 'testcafe|native-dialog-tracker|unexpected-dialog';
const ERROR_IN_HANDLER                  = 'testcafe|native-dialog-tracker|error-in-handler';
const GETTING_PAGE_URL_PROCESSED_SCRIPT = processScript('window.location.href');


export default class NativeDialogTracker {
    constructor (contextStorage, dialogHandler) {
        this.contextStorage = contextStorage;
        this.dialogHandler  = dialogHandler;

        this._init();
        this._initListening();

        if (this.dialogHandler)
            this.setHandler(dialogHandler);
    }

    get appearedDialogs () {
        var dialogs = this.contextStorage.getItem(APPEARED_DIALOGS);

        if (!dialogs) {
            dialogs              = [];
            this.appearedDialogs = dialogs;
        }

        return dialogs;
    }

    set appearedDialogs (dialog) {
        this.contextStorage.setItem(APPEARED_DIALOGS, dialog);
    }

    get unexpectedDialog () {
        return this.contextStorage.getItem(UNEXPECTED_DIALOG);
    }

    set unexpectedDialog (dialog) {
        this.contextStorage.setItem(UNEXPECTED_DIALOG, dialog);
    }

    get handlerError () {
        return this.contextStorage.getItem(ERROR_IN_HANDLER);
    }

    set handlerError (dialog) {
        this.contextStorage.setItem(ERROR_IN_HANDLER, dialog);
    }

    static _getPageUrl () {
        return nativeMethods.eval(GETTING_PAGE_URL_PROCESSED_SCRIPT);
    }

    _initListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg = e.message;

            if (msg.type === MESSAGE_TYPE.appearedDialog)
                this._addAppearedDialogs(msg.dialogType, msg.text, msg.url);

            else if (msg.type === MESSAGE_TYPE.unexpectedDialog && !this.unexpectedDialog)
                this.unexpectedDialog = { type: msg.dialogType, url: msg.url };

            else if (msg.type === MESSAGE_TYPE.handlerError && !this.handlerError)
                this._onHandlerError(msg.dialogType, msg.message, msg.url);
        });
    }

    _init () {
        hammerhead.on(hammerhead.EVENTS.beforeUnload, e => {
            if (e.prevented && !e.isFakeIEEvent) {
                if (this.dialogHandler) {
                    var handler = this._createDialogHandler('beforeunload');

                    handler(e.returnValue || '');
                }
                else
                    this._defaultDialogHandler('beforeunload');
            }

            // NOTE: we should save changes that could be made via 'shift' and 'push' methods.
            if (this.contextStorage)
                this.contextStorage.save();
        });

        window.alert   = () => this._defaultDialogHandler('alert');
        window.confirm = () => this._defaultDialogHandler('confirm');
        window.prompt  = () => this._defaultDialogHandler('prompt');
    }

    _createDialogHandler (type) {
        return text => {
            var url = NativeDialogTracker._getPageUrl();

            this._addAppearedDialogs(type, text, url);

            var executor = new ClientFunctionExecutor(this.dialogHandler);
            var result   = null;

            try {
                result = executor.fn.apply(window, [type, text, url]);
            }
            catch (err) {
                this._onHandlerError(type, err.message || String(err), url);
            }

            return result;
        };
    }

    // Overridable methods
    _defaultDialogHandler (type) {
        var url = NativeDialogTracker._getPageUrl();

        this.unexpectedDialog = this.unexpectedDialog || { type, url };
    }

    _addAppearedDialogs (type, text, url) {
        this.appearedDialogs.splice(0, 0, { type, text, url });
    }

    _onHandlerError (type, message, url) {
        this.handlerError = this.handlerError || { type, message, url };
    }

    // API
    setHandler (dialogHandler) {
        this.dialogHandler = dialogHandler;

        ['alert', 'confirm', 'prompt'].forEach(dialogType => {
            window[dialogType] = this.dialogHandler ?
                this._createDialogHandler(dialogType) :
                () => this._defaultDialogHandler(dialogType);
        });
    }

    getUnexpectedDialogError () {
        var unexpectedDialog = this.unexpectedDialog;
        var handlerError     = this.handlerError;

        this.unexpectedDialog = null;
        this.handlerError     = null;

        if (unexpectedDialog)
            return new NativeDialogNotHandledError(unexpectedDialog.type, unexpectedDialog.url);

        if (handlerError)
            return new UncaughtErrorInNativeDialogHandler(handlerError.type, handlerError.message, handlerError.url);

        return null;
    }
}
