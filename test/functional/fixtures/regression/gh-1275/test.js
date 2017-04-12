describe('[Regression](GH-1275)', function () {
    it('Blur event should not raise too late when an input became hidden in IE', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Hide input on blur', { only: ['ie'] });
    });
});
