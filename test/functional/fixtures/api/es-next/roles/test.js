var expect = require('chai').expect;

describe('[API] t.useRole()', function () {
    it('Should initialize and switch roles', function () {
        return runTests('./testcafe-fixtures/use-role-test.js', null, { only: 'chrome,ie,firefox' });
    });

    it('Should switch to Role.anonymous()', function () {
        return runTests('./testcafe-fixtures/anonymous-role-test.js');
    });

    it('Should have clean configuration in role initializer', function () {
        return runTests('./testcafe-fixtures/configuration-test.js', 'Clear configuration', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('- Error in Role initializer - A native alert dialog was invoked');
                expect(errs[0]).contains('> 31 |    await t.click(showAlertBtn);');
            });
    });

    it('Should restore configuration after role initializer', function () {
        return runTests('./testcafe-fixtures/configuration-test.js', 'Restore configuration', { selectorTimeout: 5000 });
    });

    describe('Errors', function () {
        it('Should fail all tests that use role with the initiliazer error', function () {
            return runTests('./testcafe-fixtures/init-error-test.js', null, {
                shouldFail: true,
                only:       'chrome,ie,firefox'
            })
                .catch(function (errs) {
                    const browsers = Object.keys(errs);

                    expect(browsers.length).eql(3);

                    browsers.forEach(function (browser) {
                        expect(errs[browser].length).eql(2);

                        errs[browser].forEach(function (err) {
                            expect(err).contains('- Error in Role initializer - Error: Hey!');
                            expect(err).contains('>  5 |    throw new Error(\'Hey!\');');
                        });
                    });

                });
        });

        it('Should fail if role switched within initializer', function () {
            return runTests('./testcafe-fixtures/errors-test.js', 'Role switch in initializer', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('- Error in Role initializer - Role cannot be switched while another role is being initialized.');
                    expect(errs[0]).contains('> 4 |    await t.useRole(Role.anonymous());');
                });
        });

        it('Should throw error if useRole argument is not a Role', function () {
            return runTests('./testcafe-fixtures/errors-test.js', 'useRole argument', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "role" argument is expected to be a Role instance, but it was object.');
                    expect(errs[0]).contains('> 16 |    await t.useRole({});');
                });
        });

        it('Should fail if there error occurred while restoring configuration', function () {
            return runTests('./testcafe-fixtures/errors-test.js', 'Error restoring configuration', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('- Error while restoring configuration after Role switch - The specified selector does not match any element in the DOM tree.');
                    expect(errs[0]).contains('> 29 |        .useRole(Role.anonymous());');
                });
        });

    });
});
