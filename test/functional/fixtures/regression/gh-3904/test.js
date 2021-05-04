// See https://github.com/DevExpress/testcafe/issues/6201 for more information.
describe.skip('GH-3904 - Should correctly switch to iframe loaded from form', function () {
    it('Should correctly switch to iframe loaded from form', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
