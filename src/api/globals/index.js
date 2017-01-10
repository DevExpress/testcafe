import Fixture from './fixture';
import Test from './test';

export default class Globals {
    constructor (filename) {
        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];
    }

    setup () {
        Object.defineProperty(global, 'fixture', {
            get:          () => new Fixture(this),
            configurable: true
        });

        Object.defineProperty(global, 'test', {
            get:          () => new Test(this),
            configurable: true
        });
    }

    remove () {
        delete global.fixture;
        delete global.test;
    }
}
