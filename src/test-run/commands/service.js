import TYPE from './type';
import ExtendedDialogCommand from './extended-dialog-command';

// Commands
export class PrepareBrowserManipulationCommand extends ExtendedDialogCommand {
    constructor (manipulationCommandType) {
        super();

        this.type                    = TYPE.prepareBrowserManipulation;
        this.manipulationCommandType = manipulationCommandType;
    }
}

export class TestDoneCommand extends ExtendedDialogCommand {
    constructor () {
        super();

        this.type = TYPE.testDone;
    }
}
