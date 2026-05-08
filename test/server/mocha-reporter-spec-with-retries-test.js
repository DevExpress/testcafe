const { expect }      = require('chai');
const path            = require('path');
const util            = require('util');
const Mocha           = require('mocha');
const SpecWithRetries = require('../../gulp/helpers/mocha-reporter-spec-with-retries');

function runSuitesWithReporter (files) {
    return new Promise((resolve, reject) => {
        const output              = [];
        const originalConsoleLog  = Mocha.reporters.Base.consoleLog;
        const mocha               = new Mocha({
            reporter: SpecWithRetries,
            timeout:  2000,
            color:    false,
        });

        files.forEach(file => {
            mocha.addFile(file);
        });

        Mocha.reporters.Base.consoleLog = (format, ...args) => {
            if (!format)
                output.push('');
            else
                output.push(util.format(format, ...args));
        };

        mocha.run(failures => {
            Mocha.reporters.Base.consoleLog = originalConsoleLog;

            if (failures)
                reject(new Error(`${failures} test(s) failed`));
            else
                resolve(output.join('\n'));
        });
    });
}

describe('Mocha reporter spec with retries', () => {
    it('Should include unstable test section grouped by source file', async () => {
        const dataDir = path.join(__dirname, 'data/mocha-reporter-spec-with-retries');
        const report  = await runSuitesWithReporter([
            path.join(dataDir, 'suite1.js'),
            path.join(dataDir, 'suite2.js'),
        ]);

        expect(report).contains('Unstable test(s):');
        expect(report).match(/suite1\.js/);
        expect(report).match(/suite2\.js/);

        expect((report.match(/Unstable - 1/g) || []).length).gte(2);
        expect((report.match(/Unstable - 2/g) || []).length).gte(2);
    });
});
