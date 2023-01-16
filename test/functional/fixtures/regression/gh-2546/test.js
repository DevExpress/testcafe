const path               = require('path');
const { expect }         = require('chai');
const { exec }           = require('child_process');
const config             = require('../../../config');
const unhandledRejection = require('./unhandled-rejection');
const semver             = require('semver');

if (config.useLocalBrowsers) {
    describe('[Regression](GH-2546)', function () {
        this.timeout(60000);

        afterEach(() => {
            unhandledRejection.delete();
        });

        //NOTE: 'unhandledRejection' hook doesn't work under NodeJS 16.x.x and higher because of Gulp
        if (semver.lt(process.version, '16.0.0')) {
            describe('uncaught promise rejection', () => {
                it('Should fail when skipUncaughtErrors is false', function () {
                    return runTests('./testcafe-fixtures/index.js', 'Unhandled promise rejection', { shouldFail: true })
                        .catch(function (errs) {
                            const allErrors = [];

                            if (!Array.isArray(errs)) {
                                const browsers = Object.keys(errs);

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

                            expect(unhandledRejection.getData()).contains('reject');
                        });
                });

                it('Should not fail when skipUncaughtErrors is true', function () {
                    return runTests('./testcafe-fixtures/index.js', 'Unhandled promise rejection', { skipUncaughtErrors: true })
                        .then(() => {
                            expect(unhandledRejection.getData()).contains('reject');
                        });
                });
            });
        }

        it('Should fail on uncaught exception when skipUncaughtErrors is false', function () {
            const testcafePath = path.resolve('bin/testcafe');
            const testFilePath = path.resolve('test/functional/fixtures/regression/gh-2546/testcafe-fixtures/uncaughtException.js');
            const browsers     = '"chrome:headless --no-sandbox"';
            const command      = `node ${testcafePath} ${browsers} ${testFilePath}`;

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

        it('Should not fail on uncaught promise rejection when skipUncaughtErrors is true', function () {
            const testcafePath = path.resolve('bin/testcafe');
            const testFilePath = path.resolve('test/functional/fixtures/regression/gh-2546/testcafe-fixtures/uncaughtException.js');
            const browsers     = '"chrome:headless --no-sandbox"';
            const args         = '--skip-uncaught-errors';
            const command      = `node ${testcafePath} ${browsers} ${testFilePath} ${args}`;

            return new Promise(resolve => {
                exec(command, (error, stdout) => {
                    resolve({ error, stdout });
                });
            }).then(value => {
                expect(value.error).is.null;
            });
        });

        it('Should handle errors in the exception handler', () => {
            const testcafePath = path.resolve('bin/testcafe');
            const testFilePath = path.resolve('test/functional/fixtures/regression/gh-2546/testcafe-fixtures/uncaughtExceptionInHandler.js');
            const browsers     = '"chrome:headless --no-sandbox"';
            const command      = `node ${testcafePath} ${browsers} ${testFilePath}`;

            return new Promise(resolve => {
                exec(command, (error, stdout) => {
                    resolve({ error, stdout });
                });
            }).then(value => {
                expect(value.stdout).contains('Exception in the code');
                expect(value.stdout).contains('Exception in the handler');
                expect(value.error).is.not.null;
            });
        });
    });
}
