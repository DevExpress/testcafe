import RawTestFileCompiler from '../raw';
import { CommandTransformerFactory } from './commands';

const TEST_BASE = JSON.stringify({
    fixtures: [
        {
            name:  'New Fixture',
            tests: [
                {
                    name:     'New Test',
                    commands: [],
                },
            ],
        },
    ],
});

export default class DevToolsTestFileCompiler extends RawTestFileCompiler {
    _hasTests () {
        return true;
    }

    getSupportedExtension () {
        return '.json';
    }

    compile (code, filename) {
        this.raw = JSON.parse(TEST_BASE);

        return super.compile(this._preProcess(code), filename);
    }

    _preProcess (code) {
        const parsedCode = JSON.parse(code);

        parsedCode.steps.forEach((step, i) => this._processStep(step, i));

        return JSON.stringify(this.raw);
    }

    _processStep (step, i) {
        const transformer = CommandTransformerFactory.create(step, i);
        const test        = this.raw.fixtures[0].tests[0];

        if (transformer)
            test.commands.push(transformer.transform());
    }
}
