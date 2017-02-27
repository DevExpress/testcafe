import TYPE from './type';

// Commands
export class PrepareBrowserManipulationCommand {
    constructor (manipulationCommandType) {
        this.type                    = TYPE.prepareBrowserManipulation;
        this.manipulationCommandType = manipulationCommandType;
    }
}

export class StartAssertionExecutionCommand {
    constructor (timeout) {
        this.type    = TYPE.startAssertionExecution;
        this.timeout = timeout;
    }
}

export class EndAssertionExecutionCommand {
    constructor (success) {
        this.type    = TYPE.endAssertionExecution;
        this.success = success;
    }
}

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}
