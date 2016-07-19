import Fixture from './fixture';
import Test from './test';
import handleTagArgs from '../../utils/handle-tag-args';

export default class Globals {
    constructor (filename) {
        this.filename       = filename;
        this.currentFixture = null;
        this.collectedTests = [];

        var globals = this;

        // NOTE: use named functions so that they appear in the stacks
        this.functions = {
            fixture (name, ...rest) {
                name = handleTagArgs(name, rest);

                globals.currentFixture = new Fixture(name, globals.filename);

                return globals.currentFixture;
            },

            test (name, fn) {
                var test = new Test(name, fn, globals.currentFixture);

                globals.collectedTests.push(test);
            }
        };
    }

    setup () {
        Object.keys(this.functions).forEach(name => {
            global[name] = this.functions[name];
        });
    }

    remove () {
        Object.keys(this.functions).forEach(name => delete global[name]);
    }
}
