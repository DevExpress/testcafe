const { expect } = require('chai');

describe('[Regression](GH-7935) Should not fail with `parsing error` if JSON file', function () {
    it('Should not fail with `parsing error` if JSON file', function () {
        return runTests('testcafe-fixtures', null, { shouldFail: true })
            .catch(err => {
                expect(err.message).contains('Source files do not contain valid \'fixture\' and \'test\' declarations.');
            });
    });
});
