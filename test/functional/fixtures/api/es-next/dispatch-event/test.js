describe('[API] t.dispatchEvent()', function () {
    it('mouse', function () {
        return runTests('testcafe-fixtures/index.js', 'mouse', { skip: ['ie', 'iphone'] });
    });

    it('keyboard', function () {
        return runTests('testcafe-fixtures/index.js', 'keyboard', { skip: ['ie', 'iphone'] });
    });

    it('input', function () {
        return runTests('testcafe-fixtures/index.js', 'input', { skip: 'ie' });
    });

    it('focus', function () {
        return runTests('testcafe-fixtures/index.js', 'focus', { skip: 'ie' });
    });

    it('pointer', function () {
        return runTests('testcafe-fixtures/index.js', 'pointer', { skip: ['ie', 'iphone', 'ipad', 'safari'] });
    });

    it('defaults', function () {
        return runTests('testcafe-fixtures/index.js', 'defaults', { skip: ['ie', 'iphone'] });
    });

    it('predifined ctor', function () {
        return runTests('testcafe-fixtures/index.js', 'predifined ctor', { skip: 'ie' });
    });

    it('custom event', function () {
        return runTests('testcafe-fixtures/index.js', 'custom event', { skip: 'ie' });
    });

    it('simple drag', function () {
        return runTests('testcafe-fixtures/index.js', 'simple drag', { skip: 'ie' });
    });
});


