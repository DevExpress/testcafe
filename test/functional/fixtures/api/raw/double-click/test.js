var expect = require('chai').expect;

describe('Run double-click from a raw file', function () {
    it('Should make double click on a button', function () {
        return runTests('./testcafe-fixtures/double-click.testcafe', 'Double click simple button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Click on input raised 2 times. Double click on input raised');
            });
    });
});
