import generateId from '../generate-id';

export const TYPE = {
    establishConnection:    'driver|establish-connection',
    commandExecuted:        'driver|command-executed',
    executeCommand:         'driver|execute-command',
    confirmation:           'driver|confirmation',
    setNativeDialogHandler: 'driver|set-native-dialog-handler',
    setAsMaster:            'driver|set-as-master',
    closeAllChildWindows:   'driver|close-all-child-windows'
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
    constructor () {
        super(TYPE.setAsMaster);
    }
}

export class CloseAllChildWindowsMessage extends InterDriverMessage {
    constructor () {
        super(TYPE.closeAllChildWindows);
    }
}
