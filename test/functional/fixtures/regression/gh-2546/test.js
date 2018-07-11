const path     = require('path');
const expect   = require('chai').expect;
const { exec } = require('child_process');

describe('[Regression](GH-2546)', function () {
    this.timeout(60000);

    it('Should fail on uncaught promise rejection when ignoreUncaughtErrors is false', function () {
        return runTests('./testcafe-fixtures/index.js', 'Unhandled promise rejection', { shouldFail: true })
            .catch(function (errs) {
                var allErrors = [];

                if (!Array.isArray(errs)) {
                    var browsers = Object.keys(errs);

                    browsers.forEach(browser => {
                        allErrors.push(errs[browser][0]);
                    });
                }
                else
                    allErrors.push(errs[0]);

                expect(allErrors.length).gte(1);

                allErrors.forEach(function (err) {
                    expect(err).contains('Unhandled promise rejection');
                });
            });
    });

    it('Should not fail on uncaught exception when ignoreUncaughtErrors is true', function () {
        let unhandledRejectionRaiseCount = 0;

        const listener = err => {
            unhandledRejectionRaiseCount++;

            expect(err.message).eql('reject');
        };

        process.on('unhandledRejection', listener);

        return runTests('./testcafe-fixtures/index.js', 'Unhandled promise rejection', { ignoreUncaughtErrors: true })
            .then(() => {
                process.removeListener('unhandledRejection', listener);

                expect(unhandledRejectionRaiseCount).gte(1);
            });
    });

    it('Should fail on uncaught exception when ignoreUncaughtErrors is false', function () {
        var testcafePath = path.resolve('bin/testcafe');
        var testFilePath = path.resolve('test/functional/fixtures/regression/gh-2546/testcafe-fixtures/uncaughtException.js');
        var browsers     = '"chrome:headless --no-sandbox"';
        var command  = `node ${testcafePath} ${browsers} ${testFilePath}`;

        return new Promise(resolve => {
            exec(command, (error, stdout) => {
                resolve({ error, stdout });
            });
        }).then(value => {
            expect(value.stdout).contains('Uncaught exception');
            expect(value.stdout).contains('unhandled');
            expect(value.error).is.not.null;
        });
    });

    it('Should not fail on uncaught promise rejection when ignoreUncaughtErrors is true', function () {
        var testcafePath = path.resolve('bin/testcafe');
        var testFilePath = path.resolve('test/functional/fixtures/regression/gh-2546/testcafe-fixtures/uncaughtException.js');
        var browsers     = '"chrome:headless --no-sandbox"';
        var args         = '--ignore-uncaught-errors';
        var command      = `node ${testcafePath} ${browsers} ${testFilePath} ${args}`;

        return new Promise(resolve => {
            exec(command, (error, stdout) => {
                resolve({ error, stdout });
            });
        }).then(value => {
            expect(value.error).is.null;
        });
    });
});
