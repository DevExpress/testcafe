var expect = require('chai').expect;

const MAX_UNLOADING_TIMEOUT = 15 * 1000;

// NOTE: we skip 'iphone,ipad' because no way to download file by link on these devices
describe('[Regression](GH-845) Should execute click on a download link', function () {
    it('gh-845', function () {
        var startTime = Date.now();

        return runTests('testcafe-fixtures/index-test.js', 'Click on a download link', { skip: 'iphone,ipad' })
            .then(() => {
                expect(Date.now() - startTime).to.be.below(MAX_UNLOADING_TIMEOUT);
            });
    });

    it('gh-845 in iframe', function () {
        var startTime = Date.now();

        return runTests('testcafe-fixtures/index-test.js', 'Click on a download link in iframe',
            { selectorTimeout: 5000, skip: 'iphone,ipad' })
            .then(() => {
                expect(Date.now() - startTime).to.be.below(MAX_UNLOADING_TIMEOUT);
            });
    });
});
