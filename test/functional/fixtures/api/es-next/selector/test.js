describe.only('[API] Selector', function () {
    it('Should provide basic properties in HTMLElement snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'HTMLElement snapshot basic properties');
    });

    it('Should provide basic properties in SVGElement snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'SVGElement snapshot basic properties');
    });

    it('Should provide input-specific properties in element snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Input-specific element snapshots properties');
    });
});
