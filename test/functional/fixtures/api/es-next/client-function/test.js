var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;
var config         = require('../../../../config');

describe('[API] ClientFunction', function () {
    it('Should be correctly dispatched to test run', function () {
        function assertUA (errs, alias, expected) {
            if (!errs[alias])
                throw new Error('Error for "' + alias + '" haven\'t created');

            var ua = parseUserAgent(errs[alias][0]).toString().toLowerCase();

            expect(ua.indexOf(expected)).eql(0, ua + ' doesn\'t start with "' + expected + '"');
        }

        var browsers = 'chrome,firefox,ie';

        return runTests('./testcafe-fixtures/client-fn-test.js', 'Dispatch', { shouldFail: true, only: browsers })
            .catch(function (errs) {
                config.browsers
                    .filter(function (browser) {
                        return browsers.indexOf(browser.alias) > -1;
                    })
                    .forEach(function (browser) {
                        assertUA(errs, browser.alias, browser.alias);
                    });
            });
    });

    it('Should accept arguments', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Call with arguments');
    });

    it('Should perform Hammerhead code instrumentation on function code', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Hammerhead code instrumentation');
    });

    it('Should be able to bind a test run using the "boundTestRun" option', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Bind ClientFunction', { only: 'chrome' });
    });

    it('Should support Promises as a result', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Promises support');
    });

    it('Should polyfill Babel artifacts', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Babel artifacts polyfills');
    });

    it('Should execute ClientFunction with dependencies', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction with dependencies');
    });

    it('Should accept complex argument types', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction call with complex argument types');
    });

    it('Should accept complex return types', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction call with complex return types');
    });

    it('Should accept a function as an argument', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction with function argument');
    });

    it('Should accept a ClientFunction as an argument', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction with ClientFunction argument');
    });

    describe('Errors', function () {
        it('Should handle errors in ClientFunction code', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Error in code', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('An error occurred in ClientFunction code:');
                    expect(errs[0]).contains('Error: Hey ya!');
                    expect(errs[0]).contains('> 126 |    await fn();');
                });
        });

        it('Should handle error in a Promise in ClientFunction code', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Error in Promise', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('An error occurred in ClientFunction code:');
                    expect(errs[0]).contains('Error: 42');
                    expect(errs[0]).contains('> 136 |    await fn();');
                });
        });

        it('Should raise an error if ClientFunction argument is not a function', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction fn is not a function', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'ClientFunction code is expected to be specified as a function, but number was passed.'
                )).eql(0);

                expect(errs[0]).contains('> 32 |    await ClientFunction(123)();');
            });
        });

        it('Should raise an error if ClientFunction not able to resolve test run', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction fn test run is unresolvable', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'ClientFunction cannot implicitly resolve the test run in context of which it should be executed.'
                )).eql(0);

                expect(errs[0]).contains(' > 43 |                await fn();');
            });
        });

        it('Should raise an error if ClientFunction contains async/await syntax', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Async syntax in ClientFunction', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'ClientFunction code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).'
                )).eql(0);

                expect(errs[0]).contains('> 54 |    ClientFunction(async () => Promise.resolve());');
            });
        });

        it('Should raise an error if ClientFunction contains generator', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Generator in ClientFunction', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'ClientFunction code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).'
                )).eql(0);

                expect(errs[0]).contains('> 58 |    ClientFunction(function*() { ');
            });
        });

        it('Should raise an error if ClientFunction bound to a non-TestController object', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Invalid ClientFunction test run binding', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'The "boundTestRun" option value is expected to be a test controller.'
                )).eql(0);

                expect(errs[0]).contains('> 94 |    ClientFunction(() => 123).with({ boundTestRun: {} });');
            });
        });

        it('Should raise an error if ClientFunction execution was interrupted by page unload', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Redirect during execution', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('ClientFunction execution was interrupted by page unload.');
                    expect(errs[0]).contains('> 160 |    await fn();');
                });
        });

        it('Should raise an error if a function argument contains `async/await` syntax', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'Async/await in function argument of ClientFunction', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'ClientFunction code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).'
                    );
                    expect(errs[0]).contains(' > 209 |    await hfn(async () => Promise.resolve());');
                });
        });

        it('Should raise an error if a DOM node is returned', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'DOM node return value', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('ClientFunction cannot return DOM elements. Use Selector functions for this purpose.');
                    expect(errs[0]).contains(' > 230 |    await getSomeNodes();');
                });
        });
    });

    describe('Regression', function () {
        it('Should successfully pass if ClientFunction missing `await` (GH-564)', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction without `await`');
        });
    });
});
