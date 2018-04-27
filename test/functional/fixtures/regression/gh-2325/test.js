describe('[Regression](GH-2325)', function () {
    it('Simulate screenX and screenY properties of event', function () {
        return runTests('testcafe-fixtures/index.js', null, { skip: ['iphone', 'ipad', 'android'] });
    });
});
