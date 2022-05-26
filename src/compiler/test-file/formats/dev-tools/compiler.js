import RawTestFileCompiler from '../raw';

import {
    CommandTransformerFactory,
    SwitchToIframeCommandTransformer,
    SwitchToMainWindowCommandTransformer,
} from './commands';

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

    get _fixture () {
        return this.raw.fixtures[0];
    }

    get _test () {
        return this._fixture.tests[0];
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

        this._fixture.name = parsedCode.title;
        this._test.name    = parsedCode.title;

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
        if (!step.frame)
            return;

        for (const frame of step.frame)
            this._test.commands.push(new SwitchToIframeCommandTransformer(frame).transform());
    }

    _onAfterCommandExecute (step) {
        this._test.commands.push(new SwitchToMainWindowCommandTransformer(step).transform());
    }
}
