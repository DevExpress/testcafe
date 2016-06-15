import generateId from '../generate-id';

export var TYPE = {
    establishConnection: 'driver|establish-connection',
    commandExecuted:     'driver|command-executed',
    executeCommand:      'driver|execute-command',
    confirmation:        'driver|confirmation'
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
    constructor (command) {
        super(TYPE.executeCommand);

        this.command = command;
    }
}

export class ConfirmationMessage extends InterDriverMessage {
    constructor (requestMessageId, result) {
        super(TYPE.confirmation);

        this.requestMessageId = requestMessageId;
        this.result           = result;
    }
}
