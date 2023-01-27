const config = require('../../config');

describe('TestCafe UI', () => {
    describe('Status Bar', () => {
        it('Should display correct status', () => {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
        });

        it('Hide elements when resizing the window', () => {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide elements when resizing the window', { skip: ['android', 'ipad', 'iphone', 'edge', 'safari'] });
        });

        it('Should hide the status bar even if document was hidden during initialization (GH-7384)', function () {
            // NOTE: the test needs direct access to the CDP client through the test controller
            if (config.experimentalDebug)
                this.skip();

            return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide status bar after mouse move', { only: ['chrome'] });
        });
    });

    describe('Selector Inspector', () => {
        function runTest (testName) {
            return runTests('./testcafe-fixtures/selector-inspector-test.js', testName, { skip: ['ie'] });
        }

        it('panel should be shown in debug mode', () => {
            return runTest('Show panel');
        });

        it('should hide TestCafe elements while piking', () => {
            return runTest('Hide TestCafe element while picking');
        });

        it('should generate valid selector', () => {
            return runTest('Generate selector');
        });

        it('should fill the selectors list with the generated selectors', () => {
            return runTest('Fill the selectors list');
        });

        it('should indicate the correct number of elements matching the selector', () => {
            return runTest('Indicate matching');
        });

        it('should indicate if the selector is invalid on input', () => {
            return runTest('Indicate invalid');
        });

        it('should indicate that no matches on input', () => {
            return runTest('Indicate no matching');
        });

        it('should highlight matches elements on input', () => {
            return runTest('Highlight elements');
        });

        it('should place a selector selected from the list in the input field', () => {
            return runTest('Select selector');
        });

        it('should copy selector', () => {
            return runTest('Copy selector');
        });
    });
});
