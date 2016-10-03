var expect = require('chai').expect;


describe('[API] t.pressKey', function () {
    it('Should press keys', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Press keys', { only: 'chrome' });
    });

    it('Should validate keys argument', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Incorrect keys argument', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contain('The "keys" argument is expected to be a non-empty string, but it was boolean.');
                expect(errs[0]).to.contain('> 19 |    await t.pressKey(false);');
            });
    });

    it('Should raise event in different windows if focus was changed during action execution', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Press key in iframe', { only: 'chrome' });
    });
});
