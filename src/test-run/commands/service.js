import TYPE from './type';

// Commands
export class PrepareBrowserManipulationCommand {
    constructor (manipulationCommandType) {
        this.type                    = TYPE.prepareBrowserManipulation;
        this.manipulationCommandType = manipulationCommandType;
    }
}

export class ShowAssertionRetriesStatusCommand {
    constructor (timeout) {
        this.type    = TYPE.showAssertionRetriesStatus;
        this.timeout = timeout;
    }
}

export class HideAssertionRetriesStatusCommand {
    constructor (success) {
        this.type    = TYPE.hideAssertionRetriesStatus;
        this.success = success;
    }
}

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}
