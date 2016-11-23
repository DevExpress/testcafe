describe('[Regression](GH-987)', function () {
    describe('Should show the target element fully while performing an action', function () {
        it('Click on the bottom element in the vertical container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll a vertical container to the bottom element');
        });

        it('Click on the top element in the vertical container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll a vertical container to the top element');
        });

        it('Click on the left element in the horizontal container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll a horizontal container to the left element');
        });

        it('Click on the right element in the horizontal container', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll a horizontal container to the right element');
        });
    });
});
