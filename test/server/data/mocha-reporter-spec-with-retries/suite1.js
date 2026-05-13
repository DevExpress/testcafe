const assert = require('assert');

describe('Test suite 1', function () {
    let unstable1RunCount = 0;
    let unstable2RunCount = 0;

    this.retries(3);

    it('Passed', () => {
        assert.ok(true);
    });

    it('Failed', () => {
        let isCorrect = false;

        try {
            assert.ok(false);
        }
        catch (_) {
            isCorrect = true;
        }

        assert.ok(isCorrect);
    });

    it('Pending');

    it('Unstable - 1', () => {
        unstable1RunCount++;

        if (unstable1RunCount === 2)
            assert.ok(true);
        else
            assert.ok(false);
    });

    it('Unstable - 2', () => {
        unstable2RunCount++;

        if (unstable2RunCount === 2)
            assert.ok(true);
        else
            assert.ok(false);
    });
});
