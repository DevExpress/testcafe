var expect = require('chai').expect;

describe('[Raw API] Right click action', function () {
    it('Should make right click on a button', function () {
        return runTests('./testcafe-fixtures/right-click.testcafe', 'Right click simple button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Right click on input raised');
            });
    });
});
