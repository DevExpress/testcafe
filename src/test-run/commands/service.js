import TYPE from './type';

// Commands
export class PrepareBrowserManipulationCommand {
    constructor (manipulationCommandType, screenshotMarkData, screenshotMarkSeed) {
        this.type                    = TYPE.prepareBrowserManipulation;
        this.manipulationCommandType = manipulationCommandType;
        this.screenshotMarkData      = screenshotMarkData;
        this.screenshotMarkSeed      = screenshotMarkSeed;
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

export class SetBreakpointCommand {
    constructor (isTestError) {
        this.type        = TYPE.setBreakpoint;
        this.isTestError = isTestError;
    }
}

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}

export class BackupStoragesCommand {
    constructor () {
        this.type = TYPE.backupStorages;
    }
}
