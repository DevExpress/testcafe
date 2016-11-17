describe('[Regression](GH-973) ', function () {
    describe('Should leave extra distance between target and browser window while performing an action', function () {
        it('Scroll to the upper left corner element in the document body', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to upper left corner element');
        });

        it('Scroll to the lower right corner element in the document body', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to lower right corner element', { skip: ['android', 'ipad', 'iphone'] });
        });

        // NOTE: we should use a different way to get the client area size on mobile devices
        it('Scroll to the lower right corner element in the document body (mobile)', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to lower right corner element (mobile)', { only: ['android', 'ipad', 'iphone'] });
        });
    });

    describe('Should leave extra distance between target and parent container while performing an action', function () {
        it('Scroll to the upper left corner element inside the container', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll to upper left corner element');
        });

        it('Scroll to the lower right corner element inside the container', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll to lower right corner element');
        });
    });
});
