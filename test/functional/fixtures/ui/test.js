describe('TestCafe UI', () => {
    describe('Status Bar', () => {
        it('Should display correct status', () => {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
        });

        it('Hide elements when resizing the window', () => {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide elements when resizing the window', { skip: ['android', 'ipad', 'iphone', 'edge', 'safari'] });
        });

        it('Should hide the status bar even if document was hidden during initialization (GH-7384)', function () {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide status bar after mouse move', { only: ['chrome'] });
        });
    });

    describe('Selector Inspector', () => {
        function runTestCafeTest (testName) {
            it (testName, function () {
                return runTests('./testcafe-fixtures/selector-inspector-test.js', testName, { skip: ['android', 'ipad', 'iphone'] });
            });
        }

        runTestCafeTest('panel should be shown in debug mode');

        runTestCafeTest('should hide TestCafe elements while piking');

        runTestCafeTest('should generate valid selector');

        runTestCafeTest('should fill the selectors list with the generated selectors');

        runTestCafeTest('should indicate the correct number of elements matching the css selector');

        runTestCafeTest('should indicate the correct number of elements matching the TestCafe selector');

        runTestCafeTest('should indicate if the selector is invalid on input');

        runTestCafeTest('should indicate that no matches on input');

        runTestCafeTest('should highlight matches elements on input');

        runTestCafeTest('should place a selector selected from the list in the input field');

        runTestCafeTest('should copy selector');

        runTestCafeTest('should hide panel');

        runTestCafeTest('should indicate the correct number of elements matching the TestCafe selector passed in debug');

        runTestCafeTest('should indicate single element matching the TestCafe selector passed in debug');
    });
});
