// NOTE: we skip 'iphone,ipad' because no way to download file by link on these devices
describe('[Regression](GH-845) Should execute click on a download link', function () {
    it('gh-845', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Click on a download link', { skip: ['iphone', 'ipad', 'android'] });
    });

    it('gh-845 in iframe', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Click on a download link in iframe',
            { selectorTimeout: 5000, only: ['chrome'] });
    });
});
