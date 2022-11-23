const {
    clickBySelector,
    getSpanTextBySelector,
    typeTextAndClickButton,
    typeToInputAndCheckResult,
} = require('./actions');

const { expect } = require('chai');

describe('[API] Custom Actions', function () {
    it('Should run custom click action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should run custom click action', { customActions: { clickBySelector } });
    });

    it('Should return value from custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should return value from custom action', {
            customActions: {
                clickBySelector,
                getSpanTextBySelector,
            },
        });
    });

    it('Should chain multiple actions inside custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should chain multiple actions', {
            customActions: {
                typeTextAndClickButton,
            },
        });
    });

    it('Should run custom action inside another custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should run custom action inside another custom action', {
            customActions: {
                typeToInputAndCheckResult,
                typeTextAndClickButton,
                getSpanTextBySelector,
            },
        });
    });

    it('Should throw an exception inside custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should throw an exception inside custom action', {
            customActions: { clickBySelector },
            shouldFail:    true,
        })
            .catch(errs => {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
            });
    });

    it('Should throw an exception due to undefined action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should throw an exception inside custom action', {
            shouldFail: true,
        })
            .catch(errs => {
                expect(errs[0]).contains('TypeError: t.custom.clickBySelector is not a function');
            });
    });
});

