var expect = require('chai').expect;

describe('[Regression](GH-2546)', function () {
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

    it('Should not fail on uncaught promise rejection when ignoreUncaughtErrors is true', function () {
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
});
