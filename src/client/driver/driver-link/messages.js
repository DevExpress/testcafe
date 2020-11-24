import generateId from '../generate-id';

export const TYPE = {
    establishConnection:         'driver|establish-connection',
    switchToWindow:              'driver|switch-to-window',
    closeWindow:                 'driver|close-window',
    closeWindowValidation:       'driver|close-window-validation',
    switchToWindowValidation:    'driver|switch-to-window-validation',
    getWindows:                  'driver|get-windows',
    commandExecuted:             'driver|command-executed',
    executeCommand:              'driver|execute-command',
    confirmation:                'driver|confirmation',
    setNativeDialogHandler:      'driver|set-native-dialog-handler',
    setAsMaster:                 'driver|set-as-master',
    closeAllChildWindows:        'driver|close-all-child-windows',
    startToRestoreChildLink:     'driver|start-to-restore-child-link',
    restoreChildLink:            'driver|restore-child-link',
    childWindowIsLoadedInIFrame: 'driver|child-window-is-loaded-in-iframe',
    childWindowIsOpenedInIFrame: 'driver|child-window-is-opened-in-iframe'
};

class InterDriverMessage {
    constructor (type) {
        this.type = type;
        this.id   = generateId();
    }
}

export class EstablishConnectionMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.establishConnection);
    }
}

export class CloseWindowValidationMessage extends InterDriverMessage {
    constructor ({ windowId }) {
        super(TYPE.closeWindowValidation);

        this.windowId = windowId;
    }
}

export class SwitchToWindowValidationMessage extends InterDriverMessage {
    constructor ({ windowId, fn }) {
        super(TYPE.switchToWindowValidation);

        this.windowId = windowId;
        this.fn       = fn;
    }
}

export class GetWindowsMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.getWindows);
    }
}

export class CloseWindowCommandMessage extends InterDriverMessage {
    constructor ({ windowId, isCurrentWindow }) {
        super(TYPE.closeWindow);

        this.windowId        = windowId;
        this.isCurrentWindow = isCurrentWindow;
    }
}

export class SwitchToWindowCommandMessage extends InterDriverMessage {
    constructor ({ windowId, fn }) {
        super(TYPE.switchToWindow);

        this.windowId = windowId;
        this.fn       = fn;
    }
}

export class CommandExecutedMessage extends InterDriverMessage {
    constructor (driverStatus) {
        super(TYPE.commandExecuted);

        this.driverStatus = driverStatus;
    }
}

export class ExecuteCommandMessage extends InterDriverMessage {
    constructor (command, testSpeed) {
        super(TYPE.executeCommand);

        this.command   = command;
        this.testSpeed = testSpeed;
    }
}

export class ConfirmationMessage extends InterDriverMessage {
    constructor (requestMessageId, result) {
        super(TYPE.confirmation);

        this.requestMessageId = requestMessageId;
        this.result           = result;
    }
}

export class SetNativeDialogHandlerMessage extends InterDriverMessage {
    constructor (dialogHandler) {
        super(TYPE.setNativeDialogHandler);

        this.dialogHandler = dialogHandler;
    }
}

export class SetAsMasterMessage extends InterDriverMessage {
    constructor (finalizePendingCommand) {
        super(TYPE.setAsMaster);

        this.finalizePendingCommand = finalizePendingCommand;
    }
}

export class CloseAllChildWindowsMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.closeAllChildWindows);
    }
}

export class StartToRestoreChildLinkMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.startToRestoreChildLink);
    }
}

export class RestoreChildLinkMessage extends InterDriverMessage {
    constructor (windowId) {
        super(TYPE.restoreChildLink);

        this.windowId = windowId;
    }
}

export class ChildWindowIsLoadedInFrameMessage extends InterDriverMessage {
    constructor (windowId) {
        super(TYPE.childWindowIsLoadedInIFrame);

        this.windowId = windowId;
    }
}

export class ChildWindowIsOpenedInFrameMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.childWindowIsOpenedInIFrame);
    }
}
