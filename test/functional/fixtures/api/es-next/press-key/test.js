const { expect } = require('chai');

describe('[API] t.pressKey', function () {
    it('Should press keys', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Press keys', { only: 'chrome' });
    });

    it('Should validate keys argument', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Incorrect keys argument', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(function (errs) {
                expect(errs[0]).to.contain('The "keys" argument is expected to be a non-empty string, but it was boolean.');
                expect(errs[0]).to.contain('> 16 |    await t.pressKey(false);');
            });
    });

    it('Should raise event in different windows if focus was changed during action execution', function () {
        return runTests('./testcafe-fixtures/press-key-test.js', 'Press key in iframe', { only: 'chrome' });
    });

    describe('Press various keys', function () {
        it('Should press literal symbol', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press literal symbol', { only: 'chrome' });
        });

        it('Should press literal symbol uppercase', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press literal symbol uppercase', { only: 'chrome' });
        });

        it('Should press two literal symbols', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press two literal symbols', { only: 'chrome' });
        });

        it('Should press number key', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press number key', { only: 'chrome' });
        });

        it('Should press special key', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press special key', { only: 'chrome' });
        });

        it('Should press mapped modifier', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Press mapped modifier', { only: 'chrome' });
        });

        it('Shift+a', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Shift+a', { only: 'chrome' });
        });

        it('Shift+1', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Shift+1', { only: 'chrome' });
        });

        it('Ctrl+a, delete', function () {
            return runTests('./testcafe-fixtures/press-various-keys-test.js', 'Ctrl+a, delete', { only: 'chrome' });
        });
    });
});
