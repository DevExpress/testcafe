describe('[Regression](GH-987)', function () {
    describe('Should fully show the target element on performing an action', function () {
        it('Click on the bottom element in the vertical container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll the vertical container to the bottom element');
        });

        it('Click on the top element in the vertical container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll the vertical container to the top element');
        });

        it('Click on the left element in the horizontal container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll the horizontal container to the left element');
        });

        it('Click on the right element in the horizontal container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll the horizontal container to the right element');
        });
    });
});
