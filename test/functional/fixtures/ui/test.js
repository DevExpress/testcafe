const config = require('../../config');


describe('TestCafe UI', () => {
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
