var expect        = require('chai').expect;
var customJsError = '%TC_TEST_ERR%';

describe('Uncaught js errors', function () {
    it('Should fail when there is no onerror handler', function () {
        return runTests('no-handler.test.js', null, { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(customJsError);
            });
    });

    it('Should fail when the onerror handler returns undefined', function () {
        return runTests('handler-returns-undefined.test.js', null, { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(customJsError);
            });
    });

    it('Should fail when iframe\'s onerror handler returns undefined', function () {
        return runTests('same-domain-iframe.test.js', null, { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(customJsError);
            });
    });

    it('Should fail when the loaded page throws an error', function () {
        return runTests('loaded.test.js', null, { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(customJsError);
            });
    });

    it('Should success when an error is raised in a cross-domain iframe', function () {
        return runTests('cross-domain-iframe.test.js', null)
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should success when the onerror handler returns true', function () {
        return runTests('handler-returns-true.test.js', null)
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should fail when there is no onerror handler (skipJsErrors enabled)', function () {
        return runTests('no-handler.test.js', null, { skipJsErrors: true })
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should fail when the onerror handler returns undefined (skipJsErrors enabled)', function () {
        return runTests('handler-returns-undefined.test.js', null, { skipJsErrors: true })
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should fail when iframe\'s onerror handler returns undefined (skipJsErrors enabled)', function () {
        return runTests('same-domain-iframe.test.js', null, { skipJsErrors: true })
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should success when the loaded page throws an error (skipJsErrors enabled)', function () {
        return runTests('loaded.test.js', null, { skipJsErrors: true })
            .then(function (err) {
                expect(err).eql('');
            });
    });
});
