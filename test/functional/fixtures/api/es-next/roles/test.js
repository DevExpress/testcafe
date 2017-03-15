var expect = require('chai').expect;

describe('[API] t.useRole()', function () {
    it('Should initialize and switch roles', function () {
        return runTests('./testcafe-fixtures/use-role-test.js');
    });

    it('Should switch to Role.anonymous()', function () {
        return runTests('./testcafe-fixtures/anonymous-role-test.js');
    });

    it('Should have clean configuration in role initializer', function () {
        return runTests('./testcafe-fixtures/configuration-test.js', 'Clear configuration', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('- Error in Role initializer - A native alert dialog was invoked');
                expect(errs[0]).contains('> 30 |    await t.click(showAlertBtn);');
            });
    });

    it('Should restore configuration after role initializer', function () {
        return runTests('./testcafe-fixtures/configuration-test.js', 'Restore configuration');
    });
});
