const config = require('../../config');

describe('TestCafe UI', () => {
    if (!config.isProxyless) {
        it('Should display correct status', () => {
            return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
        });
    }

    it('Hide elements when resizing the window', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide elements when resizing the window', { skip: ['android', 'ipad', 'iphone', 'edge'] });
    });
});
