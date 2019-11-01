describe('[Regression](GH-4360) - Should not throw \'contextStorage is undefined\' error', function () {
    it('Submit form in iframe immediately after load', function () {
        return runTests('testcafe-fixtures/index.js', null, { skip: ['chrome-osx', 'firefox-osx', 'ipad', 'iphone'] });
    });
});


