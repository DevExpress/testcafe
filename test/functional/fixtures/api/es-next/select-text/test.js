var expect = require('chai').expect;


describe('[API] Select text', function () {
    describe('t.selectText', function () {
        it('Should select text in input', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Select text in input', { only: 'chrome' });
        });

        it('Should validate selector argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect selector in selectText', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but object was passed.'
                    );
                    expect(errs[0]).contains('> 51 |    await t.selectText(null, 2, 4);');
                });
        });

        it('Should validate startPos argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect startPos in selectText', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "startPos" argument is expected to be a positive integer, but it was -1.');
                    expect(errs[0]).contains('> 55 |    await t.selectText(\'#input\', -1, 4);');
                });
        });

        it('Should validate endPos argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect endPos in selectText', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "endPos" argument is expected to be a positive integer, but it was NaN.');
                    expect(errs[0]).contains('> 59 |    await t.selectText(\'#input\', 2, NaN);');
                });
        });
    });

    describe('t.selectTextAreaContent', function () {
        it('Should select content in textarea', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Select content in textarea', { only: 'chrome' });
        });

        it('Should validate selector argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect selector in selectTextAreaContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but object was passed.'
                    );
                    expect(errs[0]).contains('> 63 |    await t.selectTextAreaContent({}, 0, 2, 1, 3);');
                });
        });

        it('Should validate startLine argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect startLine in selectTextAreaContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "startLine" argument is expected to be a positive integer, but it was 3.1.');
                    expect(errs[0]).contains('> 67 |    await t.selectTextAreaContent(\'#textarea\', 3.1, 2, 1, 3);');
                });
        });

        it('Should validate startPos argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect startPos in selectTextAreaContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "startPos" argument is expected to be a positive integer, but it was string.');
                    expect(errs[0]).contains('> 71 |    await t.selectTextAreaContent(\'#textarea\', 0, \'2\', 1, 3);');
                });
        });

        it('Should validate endLine argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect endLine in selectTextAreaContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "endLine" argument is expected to be a positive integer, but it was -1.');
                    expect(errs[0]).contains('> 75 |    await t.selectTextAreaContent(\'#textarea\', 0, 2, -1, 3);');
                });
        });

        it('Should validate endPos argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect endPos in selectTextAreaContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "endPos" argument is expected to be a positive integer, but it was boolean.');
                    expect(errs[0]).contains('> 79 |    await t.selectTextAreaContent(\'#textarea\', 0, 2, 1, false);');
                });
        });
    });

    describe('t.selectEditableContent', function () {
        it('Should select editable content', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Select editable content', { only: 'chrome' });
        });

        it('Should create simple inverse selection in editable content', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'simple inverse selection in contenteditable');
        });

        it('Should create difficult inverse selection in editable content', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'difficult inverse selection in contenteditable');
        });

        it('Should validate startSelector argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect startSelector in selectEditableContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "startSelector" argument error:  ' +
                        'Selector is expected to be initialized with a function, CSS selector string, another ' +
                        'Selector, node snapshot or a Promise returned by a Selector, but boolean was passed.' +
                        '');
                    expect(errs[0]).contains('> 83 |    await t.selectEditableContent(false, \'#p2\');');
                });
        });

        it('Should validate endSelector argument', function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Incorrect endSelector in selectEditableContent', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "endSelector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned by ' +
                        'a Selector, but number was passed.'
                    );
                    expect(errs[0]).contains('> 87 |    await t.selectEditableContent(\'#p1\', 42);');
                });
        });

        it("Should validate node type of element that startElement's selector returns", function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'Start element selector returns text node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The specified "startSelector" is expected to match a DOM element, but it matches a text node.');
                    expect(errs[0]).to.contains('> 93 |    await t.selectEditableContent(getNode, \'#p1\');');
                });
        });

        it("Should validate node type of element that endElement's selector returns", function () {
            return runTests('./testcafe-fixtures/select-text-test.js', 'End element selector returns text node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The specified "endSelector" is expected to match a DOM element, but it matches a text node.');
                    expect(errs[0]).to.contains('>  99 |    await t.selectEditableContent(\'#p1\', getNode);');
                });
        });
    });
});
