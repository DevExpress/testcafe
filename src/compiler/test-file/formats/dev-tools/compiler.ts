import RawTestFileCompiler from '../raw/compiler';
import Test from '../../../../api/structure/test';
import { CommandTransformerFactory } from './commands/factory';
import { SwitchToIframeCommandTransformer } from './commands/switch-to-iframe';
import { SwitchToMainWindowCommandTransformer } from './commands/switch-to-main-window';

import {
    DevToolsRecorderStep,
    RawFixture,
    RawRecording,
    RawTest,
} from './types';

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
    private raw: RawRecording = { fixtures: [] };

    _hasTests (): boolean {
        return true;
    }

    get _fixture (): RawFixture {
        return this.raw.fixtures[0];
    }

    get _test (): RawTest {
        return this._fixture.tests[0];
    }

    getSupportedExtension (): string {
        return '.json';
    }

    compile (code: string, filename: string): Test[] {
        this.raw = JSON.parse(TEST_BASE);

        const preprocessedCode = this._preProcess(code, filename);

        if (!preprocessedCode)
            return [];

        return super.compile(preprocessedCode, filename);
    }

    _preProcess (code: string, filename: string): string | null {
        const parsedCode = JSON.parse(code);

        this._fixture.name = parsedCode.title;
        this._test.name    = parsedCode.title;

        if (!parsedCode.steps)
            return null;

        parsedCode.steps.forEach((step: DevToolsRecorderStep, i: number) => this._processStep(step, filename, i));

        return JSON.stringify(this.raw);
    }

    _processStep (step: DevToolsRecorderStep, filename:string, i: number): void {
        const transformer = CommandTransformerFactory.create(step, filename, i);

        if (transformer) {
            this._onBeforeCommandExecute(step);
            this._test.commands.push(transformer.transform());
            this._onAfterCommandExecute(step);
        }
    }

    _onBeforeCommandExecute (step: DevToolsRecorderStep): void {
        if (!step.frame)
            return;

        const frames = step.frame as number[];

        for (const frame of frames)
            this._test.commands.push(new SwitchToIframeCommandTransformer({ frame }, 0).transform());
    }

    _onAfterCommandExecute (step: DevToolsRecorderStep): void {
        this._test.commands.push(new SwitchToMainWindowCommandTransformer(step, 0).transform());
    }
}
