describe('[API] Speed', function () {
    it('Should add an additional delay after action if speed is decreased', function () {
        return runTests('./testcafe-fixtures/speed-test.js', 'Decrease speed', { only: 'chrome', speed: 0.4 });
    });

    it('Should not add an additional delay after action by default', function () {
        return runTests('./testcafe-fixtures/speed-test.js', 'Default speed', { only: 'chrome' });
    });
});
