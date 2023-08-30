describe('[API] t.dispatchEvent()', function () {
    it('mouse', function () {
        return runTests('testcafe-fixtures/index.js', 'mouse', { skip: ['iphone'] });
    });

    it('keyboard', function () {
        return runTests('testcafe-fixtures/index.js', 'keyboard', { skip: ['iphone'] });
    });

    it('input', function () {
        return runTests('testcafe-fixtures/index.js', 'input', { skip: ['safari'] });
    });

    it('focus', function () {
        return runTests('testcafe-fixtures/index.js', 'focus');
    });

    it('pointer', function () {
        return runTests('testcafe-fixtures/index.js', 'pointer', { skip: ['iphone', 'ipad', 'safari'] });
    });

    it('defaults', function () {
        return runTests('testcafe-fixtures/index.js', 'defaults', { skip: ['iphone'] });
    });

    it('predefined ctor', function () {
        return runTests('testcafe-fixtures/index.js', 'predefined ctor');
    });

    it('custom event', function () {
        return runTests('testcafe-fixtures/index.js', 'custom event');
    });

    it('simple drag', function () {
        return runTests('testcafe-fixtures/index.js', 'simple drag');
    });
});


