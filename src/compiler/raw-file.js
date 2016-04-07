import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { createCommandFromObject } from '../test-run/commands';


export default class RawFileCompiler {
    canCompile (code, filename) {
        return /\.testcafe$/.test(filename);
    }

    _compileTest (fixture, test) {
        test.fixture = fixture;

        test.fn = async testRun => {
            for (var i = 0; i < test.commands.length; i++) {
                var command = createCommandFromObject(test.commands[i]);

                await testRun.executeCommand(command);
            }
        };

        return test;
    }

    compile (code, filename) {
        var data = null;

        try {
            data = JSON.parse(code);
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cannotParseRawFile, filename, err.toString());
        }

        var fixtures = data.fixtures;
        var tests    = [];

        fixtures.forEach(fixture => {
            fixture.path  = filename;
            fixture.tests = fixture.tests.map(test => this._compileTest(fixture, test));
            tests         = tests.concat(fixture.tests);
        });

        return tests;
    }
}
