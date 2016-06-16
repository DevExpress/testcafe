import TYPE from './type';

// Commands
export class PrepareBrowserManipulationCommand {
    constructor () {
        this.type = TYPE.prepareBrowserManipulation;
    }
}

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}
