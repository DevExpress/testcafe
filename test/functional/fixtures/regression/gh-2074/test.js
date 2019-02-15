const expect = require('chai').expect;

describe('[Regression](GH-2074)', function () {
    it('Should execute test located in external module', function () {
        return runTests('testcafe-fixtures/index.js', null, { shouldFail: true })
            .catch(errors => {
                if (Array.isArray(errors))
                    expect(errors[0]).contains('test is executed');
                else {
                    Object.values(errors).forEach(err => {
                        expect(err[0]).contains('test is executed');
                    });
                }
            });
    });
});

