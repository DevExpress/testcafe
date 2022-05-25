import RawTestFileCompiler from '../raw';
import { CommandTransformerFactory, SwitchToMainWindowCommandTransformer } from './commands';
import { SwitchToParentWindowCommand } from "../../../../test-run/commands/actions";

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

    get _test () {
        return this.raw.fixtures[0].tests[0];
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

        if (transformer) {
            this._onBeforeCommandExecute(step);
            this._test.commands.push(transformer.transform());
            this._onAfterCommandExecute(step);
        }
    }

    _onBeforeCommandExecute (step) {
        this._test.commands.push();
    }

    _onAfterCommandExecute (step) {
        this._test.commands.push(new SwitchToMainWindowCommandTransformer(step));
    }
}
