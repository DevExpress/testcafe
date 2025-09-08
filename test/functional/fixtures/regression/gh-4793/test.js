describe('[Regression](GH-4793)', function () {
    ('Elements inside cross-domain iframes should be focusable', function () {
        // TODO: skipped in Safari due to https://github.com/DevExpress/testcafe-private/issues/556
        return runTests('testcafe-fixtures/index-test.js', 'Type text into an input inside a cross-domain iframe', { skip: ['safari'] });
    });
});
