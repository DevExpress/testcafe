describe('[API] Selector', function () {
    it('Should provide basic properties in HTMLElement snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'HTMLElement snapshot basic properties');
    });

    it('Should provide basic properties in SVGElement snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'SVGElement snapshot basic properties');
    });

    it('Should provide input-specific properties in element snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Input-specific element snapshot properties');
    });

    it('Should provide `innerText` property in element snapshot', function () {
        // TODO: enable tests for IE once we have https://github.com/DevExpress/testcafe-hammerhead/issues/626
        // resolved and `innerText` normalization implemented
        return runTests('./testcafe-fixtures/selector-test.js', '`innerText` element snapshot property', {only: ['chrome', 'ff']});
    });
});
