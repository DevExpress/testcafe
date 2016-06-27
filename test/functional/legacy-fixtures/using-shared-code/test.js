describe('Using shared code in iframe pages', function () {
    it('Should pass when using an external library in a cross-domain page', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using shared code in iframe   →   Cross-domain iframe');
    });

    it('Should pass when using an external library in a same-domain page', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using shared code in iframe   →   Same-domain iframe');
    });

    it('Should pass when using an external library in an iframe page without source', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using shared code in iframe   →   Inline iframe');
    });

    it('Should pass when using a mixin in a cross-domain page', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using mixin in iframe   →   Cross-domain iframe');
    });

    it('Should pass when using a mixin in a same-domain page', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using mixin in iframe   →   Same-domain iframe');
    });

    it('Should pass when using a mixin in an iframe page without source', function () {
        return runTests('testcafe-fixtures/shared-code.test.js', 'Using mixin in iframe   →   Inline iframe');
    });
});
