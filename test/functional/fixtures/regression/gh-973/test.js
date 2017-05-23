describe('[Regression](GH-973) ', function () {
    describe('Should leave an extra distance between the target and browser window while performing an action', function () {
        // TODO: Android disabled because of https://github.com/DevExpress/testcafe/issues/1492
        it('Scroll to the upper left corner element in the document body', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to the upper left corner element', { skip: ['android'] });
        });

        it('Scroll to the lower right corner element in the document body', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to the lower right corner element', { skip: ['android', 'ipad', 'iphone'] });
        });

        // NOTE: we should use a different way to get the client area size on mobile devices
        // TODO: Android disabled because of https://github.com/DevExpress/testcafe/issues/1492
        it('Scroll to the lower right corner element in the document body (mobile)', function () {
            return runTests('./testcafe-fixtures/index.test.js', 'Scroll to the lower right corner element (mobile)', { only: ['ipad', 'iphone'] });
        });
    });

    describe('Should leave an extra distance between the target and parent container while performing an action', function () {
        it('Scroll container to the upper left corner element', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll container to the upper left corner element');
        });

        it('Scroll container to the lower right corner element', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll container to the lower right corner element');
        });
    });

    describe('Should leave an extra distance between the target and parent small container while performing an action', function () {
        it('Scroll small container to the upper left corner element', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll small container to the upper left corner element');
        });

        it('Scroll small container to the lower right corner element', function () {
            return runTests('./testcafe-fixtures/container.test.js', 'Scroll small container to the lower right corner element');
        });
    });
});
