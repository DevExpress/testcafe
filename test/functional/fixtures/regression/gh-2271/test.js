describe('[Regression](GH-2271)', function () {
    it('Drag events should contain relatedTarget property', function () {
        return runTests('testcafe-fixtures/index.js', null, { skip: ['iphone', 'ipad', 'android'] });
    });
});
