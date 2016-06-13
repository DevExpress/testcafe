var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;

describe('[API] ClientFunction', function () {
    it('Should be correctly dispatched to test run', function () {
        function assertUA (errs, alias, expected) {
            var ua = parseUserAgent(errs[alias][0]).toString();

            expect(ua.indexOf(expected)).eql(0);
        }

        return runTests('./testcafe-fixtures/client-fn-test.js', 'Dispatch', { shouldFail: true })
            .catch(function (errs) {
                assertUA(errs, 'chrome', 'Chrome');
                assertUA(errs, 'ff', 'Firefox');
                assertUA(errs, 'ie', 'IE');
            });
    });

    it('Should accept arguments', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Call with arguments');
    });

    it('Should perform Hammerhead code instrumentation on function code', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Hammerhead code instrumentation');
    });

    it('Should raise an error if ClientFunction argument is not a function', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction fn is not a function', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'ClientFunction code is expected to be specified as a function, but "number" was passed.'
            )).eql(0);

            expect(errs[0]).contains('> 29 |    await ClientFunction(123)();');
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

            expect(errs[0]).contains(' > 40 |                fn();');
        });
    });

    it('Should raise an error if ClientFunction contains async/await syntax', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Async syntax in ClientFunction', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'ClientFunction code cannot contain generators or `async/await` syntax (use Promises instead).'
            )).eql(0);

            expect(errs[0]).contains('> 51 |    ClientFunction(async () => Promise.resolve());');
        });
    });

    it('Should raise an error if ClientFunction contains generator', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Generator in ClientFunction', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'ClientFunction code cannot contain generators or `async/await` syntax (use Promises instead).'
            )).eql(0);

            expect(errs[0]).contains('> 55 |    ClientFunction(function*() { ');
        });
    });

    it('Should be able to bind a test run using `.bindTestRun(t)` method', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Bind ClientFunction', { only: 'chrome' });
    });

    it('Should raise an error if ClientFunction bound to a non-TestController object', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Invalid ClientFunction test run binding', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'The `bindTestRun` function is expected to take a test controller.'
            )).eql(0);

            expect(errs[0]).contains('> 91 |    ClientFunction(() => 123).bindTestRun({});');
        });
    });

    it('Should support Promises as a result', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Promises support');
    });

    it('Should polyfill Babel artifacts', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Babel artifacts polyfills');
    });

    it('Should handle errors in ClientFunction code', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Error in code', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in hybrid function code:');
                expect(errs[0]).contains('Error: Hey ya!');
                expect(errs[0]).contains('> 123 |    await fn();');
            });
    });

    it('Should handle error in a Promise in ClientFunction code', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Error in Promise', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in hybrid function code:');
                expect(errs[0]).contains('Error: 42');
                expect(errs[0]).contains('> 133 |    await fn();');
            });
    });

    it('Should execute ClientFunction with dependencies', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction dependencies');
    });

    it('Should raise an error if ClientFunction execution was interrupted by page unload', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Redirect during execution', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Hybrid function execution was interrupted by page unload.');
                expect(errs[0]).contains("> 153 |    await ClientFunction(() => new Promise(() => window.location = 'index.html'))();");
            });
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

    it('Should raise an error if a function argument contains async code', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'Async code in function argument of ClientFunction', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains(
                    'Hybrid function argument is a function that contains either generators or the async/await syntax. ' +
                    'These features cannot be used in hybrid function code. Use Promises instead.'
                );
                expect(errs[0]).contains(' > 202 |    await hfn(async () => Promise.resolve());');
            });
    });

    it('Should accept a hybrid as an argument', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction with hybrid argument');
    });

    it('Should raise an error if a DOM node is returned', function () {
        return runTests('./testcafe-fixtures/client-fn-test.js', 'DOM node return value', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Regular Hybrid functions cannot return DOM elements. Use Selector functions for this purpose.');
                expect(errs[0]).contains(' > 223 |    await getSomeNodes();');
            });
    });

    describe('Regression', function () {
        it('Should successfully pass if ClientFunction missing `await` (GH-564)', function () {
            return runTests('./testcafe-fixtures/client-fn-test.js', 'ClientFunction without `await`');
        });
    });
});
