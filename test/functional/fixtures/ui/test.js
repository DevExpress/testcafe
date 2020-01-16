describe('TestCafe UI', () => {
    it('Should display correct status', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
    });

    it('Hide elements when resizing the window', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Hide elements when resizing the window', { skip: ['android', 'ipad', 'iphone', 'edge'] });
    });
});
