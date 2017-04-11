describe('[Regression](GH-845) Should execute click on a download link', function () {
    it('gh-845', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on a download link', { skip: ['android'] });
    });

    it('gh-845 in iframe', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on a download link in iframe', {
            selectorTimeout: 5000,
            skip:            ['android']
        });
    });
});
