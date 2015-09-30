import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var EventEmitter = testCafeCore.serviceUtils.EventEmitter;


export const UNEXPECTED_DIALOG_ERROR_EVENT       = 'unexpectedDialogError';
export const WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT = 'wasNotExpectedDialogError';
export const DIALOGS_INFO_CHANGED_EVENT          = 'dialogsInfoChangedEvent';


var dialogsInfo = null; //NOTE: call the onDialogsInfoChanged function when you change this

var beforeUnloadEventWasRaised = false;

var eventEmitter = new EventEmitter();

export function on (event, handler) {
    eventEmitter.on(event, handler);
}

function initDialogsInfo (info) {
    if (!info) {
        dialogsInfo = {
            expectAlertCount:           0,
            expectConfirmCount:         0,
            expectPromptCount:          0,
            expectedConfirmRetValues:   [],
            expectedPromptRetValues:    [],
            expectBeforeUnload:         false,
            alerts:                     [],
            confirms:                   [],
            prompts:                    [],
            beforeUnloadDialogAppeared: false
        };
    }
    else
        dialogsInfo = info;
}

function onDialogsInfoChanged () {
    eventEmitter.emit(DIALOGS_INFO_CHANGED_EVENT, {
        info: dialogsInfo
    });
}

function beforeUnloadHandler (e) {
    dialogsInfo.beforeUnloadDialogAppeared = !!e.prevented;
    beforeUnloadEventWasRaised             = true;

    if (dialogsInfo.beforeUnloadDialogAppeared)
        onDialogsInfoChanged();

    if (dialogsInfo.beforeUnloadDialogAppeared && !dialogsInfo.expectBeforeUnload)
        sendUnexpectedDialogError('beforeUnload', e.returnValue === true ? '' : e.returnValue.toString());
}

function initDialogs (info) {
    initDialogsInfo(info);

    window.alert = function (message) {
        dialogsInfo.alerts.push(message);
        onDialogsInfoChanged();

        if (dialogsInfo.alerts.length > dialogsInfo.expectAlertCount)
            sendUnexpectedDialogError('alert', message);
    };

    window.confirm = function (message) {
        var returnValue = dialogsInfo.expectedConfirmRetValues[dialogsInfo.confirms.length];

        dialogsInfo.confirms.push(message);
        onDialogsInfoChanged();

        if (dialogsInfo.confirms.length > dialogsInfo.expectConfirmCount)
            sendUnexpectedDialogError('confirm', message);

        return returnValue;
    };

    window.prompt = function (message) {
        var returnValue = dialogsInfo.expectedPromptRetValues[dialogsInfo.prompts.length];

        dialogsInfo.prompts.push(message);
        onDialogsInfoChanged();

        if (dialogsInfo.prompts.length > dialogsInfo.expectPromptCount)
            sendUnexpectedDialogError('prompt', message);

        return returnValue;

    };
}

function sendUnexpectedDialogError (dialog, message) {
    //NOTE: the following dialogs are not raised in browsers after before unload event
    if (/alert|confirm|prompt/.test(dialog) && beforeUnloadEventWasRaised)
        return;

    eventEmitter.emit(UNEXPECTED_DIALOG_ERROR_EVENT, {
        dialog:  dialog,
        message: message
    });
}

function sendWasNotExpectedDialog (dialog) {
    eventEmitter.emit(WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT, {
        dialog: dialog
    });
}

export function init (info) {
    hammerhead.on(hammerhead.EVENTS.beforeUnload, beforeUnloadHandler);

    beforeUnloadEventWasRaised = false;
    initDialogs(info);
}

export function destroy () {
    hammerhead.off(hammerhead.EVENTS.beforeUnload, beforeUnloadHandler);
}

export function handleAlert () {
    dialogsInfo.expectAlertCount++;
    onDialogsInfoChanged();
}

export function handleConfirm (value) {
    dialogsInfo.expectConfirmCount++;
    dialogsInfo.expectedConfirmRetValues.push(!(!value || value === 'Cancel'));
    onDialogsInfoChanged();
}

export function handlePrompt (value) {
    dialogsInfo.expectPromptCount++;
    dialogsInfo.expectedPromptRetValues.push((value || value === '') ? value : null);
    onDialogsInfoChanged();
}

export function handleBeforeUnload () {
    dialogsInfo.expectBeforeUnload = true;
    onDialogsInfoChanged();
}

export function resetHandlers () {
    initDialogs();
    onDialogsInfoChanged();
}

export function hasUnexpectedBeforeUnloadDialog () {
    return dialogsInfo && dialogsInfo.beforeUnloadDialogAppeared && !dialogsInfo.expectBeforeUnload;
}

export function checkExpectedDialogs () {
    if (dialogsInfo.expectAlertCount && dialogsInfo.alerts.length < dialogsInfo.expectAlertCount)
        sendWasNotExpectedDialog('alert');

    if (dialogsInfo.expectConfirmCount && dialogsInfo.confirms.length < dialogsInfo.expectConfirmCount)
        sendWasNotExpectedDialog('confirm');

    if (dialogsInfo.expectPromptCount && dialogsInfo.prompts.length < dialogsInfo.expectPromptCount)
        sendWasNotExpectedDialog('prompt');

    if (dialogsInfo.alerts.length > dialogsInfo.expectAlertCount)
        sendUnexpectedDialogError('alert', dialogsInfo.alerts[dialogsInfo.expectAlertCount]);

    if (dialogsInfo.confirms.length > dialogsInfo.expectConfirmCount)
        sendUnexpectedDialogError('confirm', dialogsInfo.confirms[dialogsInfo.expectConfirmCount]);

    if (dialogsInfo.prompts.length > dialogsInfo.expectPromptCount)
        sendUnexpectedDialogError('prompt', dialogsInfo.prompts[dialogsInfo.expectPromptCount]);

    if (dialogsInfo.expectBeforeUnload && !dialogsInfo.beforeUnloadDialogAppeared)
        sendWasNotExpectedDialog('beforeUnload');
}
