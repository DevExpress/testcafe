import hammerhead from './deps/hammerhead';
import { waitFor } from './deps/testcafe-core';
import {
    UnexpectedDialogError,
    ExpectedDialogNotAppearedError,
    ClientFunctionInterruptedByDialogError
} from '../../errors/test-run';
import { DIALOG_TYPE, EXPECTED_HANDLER_TYPE } from '../../test-run/browser-dialogs';


const CHECK_DIALOGS_DELAY = 200;

const EXPECTED_DIALOGS                = 'testcafe|dialogs-monitor|expected-dialogs';
const APPEARED_DIALOGS                = 'testcafe|dialogs-monitor|appeared-dialogs';
const UNEXPECTED_DIALOG               = 'testcafe|dialogs-monitor|unexpected-dialog';
const DEFAULT_WAIT_FOR_DIALOG_TIMEOUT = 10000;

export default class NativeDialogTracker {
    constructor (contextStorage, expectedDialogs) {
        this.contextStorage = contextStorage;

        if (expectedDialogs)
            this.expectedDialogs = expectedDialogs;

        this._init();
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

    get expectedDialogs () {
        var dialogs = this.contextStorage.getItem(EXPECTED_DIALOGS);

        if (!dialogs) {
            dialogs              = [];
            this.expectedDialogs = dialogs;
        }

        return dialogs;
    }

    set expectedDialogs (dialog) {
        this.contextStorage.setItem(EXPECTED_DIALOGS, dialog);
    }

    get unexpectedDialog () {
        return this.contextStorage.getItem(UNEXPECTED_DIALOG);
    }

    set unexpectedDialog (dialog) {
        this.contextStorage.setItem(UNEXPECTED_DIALOG, dialog);
    }

    _handleDialog (type) {
        this.appearedDialogs.push(type);

        var expectedDialog = this.expectedDialogs.shift();

        if ((!expectedDialog || expectedDialog.type !== type) && !this.unexpectedDialog) {
            this.unexpectedDialog = type;
            return null;
        }

        return expectedDialog ? expectedDialog.returnValue : null;
    }

    _init () {
        hammerhead.on(hammerhead.EVENTS.beforeUnload, e => {
            if (e.prevented && !e.isFakeIEEvent)
                this._handleDialog(DIALOG_TYPE.beforeUnload, e.returnValue.toString() || '');

            // NOTE: we should save changes that could be made via 'shift' and 'push' methods.
            this.contextStorage.save();

            return null;
        });

        window.alert   = text => this._handleDialog(DIALOG_TYPE.alert, text);
        window.confirm = text => this._handleDialog(DIALOG_TYPE.confirm, text);
        window.prompt  = text => this._handleDialog(DIALOG_TYPE.prompt, text);
    }

    getUnexpectedDialogError (instantiationCallsiteName) {
        var unexpectedDialog = this.unexpectedDialog;

        if (unexpectedDialog) {
            this.unexpectedDialog = null;

            var expectedHandlerType = EXPECTED_HANDLER_TYPE[unexpectedDialog];

            if (instantiationCallsiteName)
                return new ClientFunctionInterruptedByDialogError(instantiationCallsiteName, unexpectedDialog, expectedHandlerType);

            return new UnexpectedDialogError(unexpectedDialog, expectedHandlerType);
        }

        return null;
    }

    waitForDialog (dialogType, timeout = DEFAULT_WAIT_FOR_DIALOG_TIMEOUT) {
        return waitFor(() => this.appearedDialogs.shift(), CHECK_DIALOGS_DELAY, timeout)
            .then(() => null)
            .catch(() => new ExpectedDialogNotAppearedError(dialogType, EXPECTED_HANDLER_TYPE[dialogType]));
    }
}
