describe('[Regression](GH-423)', function () {
    it('Should raise click event except in Firefox if target element appends child after mousedown', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise click if target appends child', { skip: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise click event in Firefox if target element appends child after mousedown", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click if target element appends child", { only: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't not raise click if target is overlapped", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click if target is overlapped");
    });

    it("Should raise click event in Firefox if target's parent has been changed after mousedown", function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise click if target parent changed', { only: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise click event except in Firefox if target's parent has been changed  after mousedown", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click if target parent changed", { skip: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise click if target appends editable form element", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click event if target appends input element");
    });
});
