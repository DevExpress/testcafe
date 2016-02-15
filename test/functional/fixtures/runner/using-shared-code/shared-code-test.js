var expect = require('chai').expect;


describe('Using shared code in iframe pages', function () {
    it('Should pass when using an external library in a cross-domain page', function () {
        return runTests('shared-code.test.js', 'Using shared code in iframe   →   Cross-domain iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should pass when using an external library in a same-domain page', function () {
        return runTests('shared-code.test.js', 'Using shared code in iframe   →   Same-domain iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should pass when using an external library in a iframe page without source', function () {
        return runTests('shared-code.test.js', 'Using shared code in iframe   →   Inline iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should pass when using a mixin in a cross-domain page', function () {
        return runTests('shared-code.test.js', 'Using mixin in iframe   →   Cross-domain iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should pass when using a mixin in a same-domain page', function () {
        return runTests('shared-code.test.js', 'Using mixin in iframe   →   Same-domain iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });

    it('Should pass when using a mixin in a iframe page without source', function () {
        return runTests('shared-code.test.js', 'Using mixin in iframe   →   Inline iframe')
            .then(function (err) {
                expect(err).eql('');
            });
    });
});
