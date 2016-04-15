var expect = require('chai').expect;

describe('[Raw API] Hover action', function () {
    it('Should make hover on a buttons', function () {
        return runTests('./testcafe-fixtures/hover.testcafe', 'Hover on simple buttons', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Hover on inputs raised');
            });
    });
});
