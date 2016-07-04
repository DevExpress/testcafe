// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import COMMAND_TYPE from './commands/type';


export const DIALOG_TYPE = {
    beforeUnload: 'beforeunload',
    alert:        'alert',
    confirm:      'confirm',
    prompt:       'prompt'
};

export const EXPECTED_HANDLER_TYPE = {
    alert:              'handleAlertDialog',
    confirm:            'handleConfirmDialog',
    prompt:             'handlePromptDialog',
    beforeUnloadDialog: 'handleBeforeUnloadDialog'
};

export function getExpectedDialogType (command) {
    /* eslint-disable indent*/
    // TODO: eslint raises an 'incorrect indent' error here. We use
    // the old eslint version (v1.x.x). We should migrate to v2.x.x
    switch (command.type) {
        case COMMAND_TYPE.handleAlertDialog:
            return DIALOG_TYPE.alert;

        case COMMAND_TYPE.handleConfirmDialog:
            return DIALOG_TYPE.confirm;

        case COMMAND_TYPE.handlePromptDialog:
            return DIALOG_TYPE.prompt;

        case COMMAND_TYPE.handleBeforeUnloadDialog:
            return DIALOG_TYPE.beforeUnload;
    }
    /* eslint-enable indent*/
}

export class ExpectedDialog {
    constructor (type, returnValue) {
        this.type        = type;
        this.returnValue = returnValue;
    }
}

