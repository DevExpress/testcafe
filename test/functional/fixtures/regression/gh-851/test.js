describe('[Regression](GH-851)', function () {
    it('Should raise click for common parent element except in Firefox', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise click for common parent', { skip: ['firefox', 'firefox-osx'] });
    });

    it('Should raise click for a top element except in Firefox', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise click for top element', { skip: ['firefox', 'firefox-osx'] });
    });

    it('Should raise dblclick for common parent element except in Firefox', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise dblclick for common element', { skip: ['firefox', 'firefox-osx'] });
    });

    it('Should raise dblclick for a top element except in Firefox', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Raise dblclick for a top element', { skip: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise click for common parent element in Firefox", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click for common parent", { only: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise click for a top element in Firefox", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise click for top element", { only: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise dblclick for common parent element in Firefox", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise dblclick for common element", { only: ['firefox', 'firefox-osx'] });
    });

    it("Shouldn't raise dblclick for a top element in Firefox", function () {
        return runTests('testcafe-fixtures/index.test.js', "Don't raise dblclick for a top element", { only: ['firefox', 'firefox-osx'] });
    });
});
