var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;

describe('[API] Hybrid function', function () {
    it('Should be correctly dispatched to test run', function () {
        function assertUA (errs, alias, expected) {
            var ua = parseUserAgent(errs[alias][0]).toString();

            expect(ua.indexOf(expected)).eql(0);
        }

        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Dispatch', { shouldFail: true })
            .catch(function (errs) {
                assertUA(errs, 'chrome', 'Chrome');
                assertUA(errs, 'ff', 'Firefox');
                assertUA(errs, 'ie', 'IE');
            });
    });

    it('Should accept arguments', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Call with arguments');
    });

    it('Should perform Hammerhead code instrumentation on function code', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Hammerhead code instrumentation');
    });

    it('Should raise error if Hybrid argument is not a function', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Hybrid fn is not a function', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'Client code is expected to be specified as a function, but "number" was passed.'
            )).eql(0);

            expect(errs[0]).contains('> 29 |    await Hybrid(123)();');
        });
    });

    it('Should raise error if Hybrid function not able to resolve test run', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Hybrid fn test run is unresolvable', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'The hybrid function cannot implicitly resolve the test run in context of which it should be executed.'
            )).eql(0);

            expect(errs[0]).contains(' > 40 |                hybrid();');
        });
    });

    it('Should raise error if Hybrid function contains async/await syntax', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Async syntax in Hybrid', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'Code executed on the client cannot contain generators or `async/await` syntax (use Promises instead).'
            )).eql(0);

            expect(errs[0]).contains('> 51 |    Hybrid(async () => Promise.resolve());');
        });
    });

    it('Should raise error if Hybrid function contains generator', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Generator in Hybrid', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'Code executed on the client cannot contain generators or `async/await` syntax (use Promises instead).'
            )).eql(0);

            expect(errs[0]).contains('> 55 |    Hybrid(function*() { ');
        });
    });

    it('Should be able to bind test run using `.bindTestRun(t)` method', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Bind Hybrid function', { only: 'chrome' });
    });

    it('Should raise error if Hybrid bound to non-TestController object', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Invalid Hybrid test run binding', {
            shouldFail: true,
            only:       'chrome'
        }).catch(function (errs) {
            expect(errs[0].indexOf(
                'The `bindTestRun` function is expected to take a test controller.'
            )).eql(0);

            expect(errs[0]).contains('> 91 |    Hybrid(() => 123).bindTestRun({});');
        });
    });

    it('Should support Promises as a result', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Promises support');
    });

    it('Should polyfill Babel artifacts', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Babel artifacts polyfills');
    });

    it('Should handle error in Hybrid code', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Error in code', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in code executed on the client:');
                expect(errs[0]).contains('Error: Hey ya!');
                expect(errs[0]).contains('> 123 |    await fn();');
            });
    });

    it('Should handle error in Promise in Hybrid code', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Error in Promise', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('An error occurred in code executed on the client:');
                expect(errs[0]).contains('Error: 42');
                expect(errs[0]).contains('> 133 |    await fn();');
            });
    });
});
