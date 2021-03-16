const expect = require('chai').expect;
const config = require('../../../../config.js');

if (!config.useLocalBrowsers) {
    describe('[API] Multiple windows remote', function () {
        it('Should fail on remote', function () {
            return runTests('./testcafe-fixtures/multiple-windows-test.js', 'Should fail on remote', { shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Multi-window mode is supported in Chrome, Chromium, Edge 84+ and Firefox only. Run tests in these browsers to use the "openWindow" method');
                });
        });
    });
}
