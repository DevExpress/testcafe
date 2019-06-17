const expect = require('chai').expect;

function removeWhitespaces (str) {
    return str.replace(/\s+|\n/g, ' ').trim();
}

function assertSelectorCallstack (actual, expected) {
    expect(removeWhitespaces(actual)).contains(removeWhitespaces(expected));
}

describe('[Regression](GH-2568)', function () {
    it('nested selector', function () {
        return runTests('testcafe-fixtures/index.js', 'nested selector', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                      > |   .filter('.non-existing-class')
                        |   .filterVisible()
                `);
            });
    });

    it('client function selector', function () {
        return runTests('testcafe-fixtures/index.js', 'client function selector', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                      > | Selector([function])
                        |   .filterVisible()
                `);
            });
    });

    it('nested client function selector', function () {
        return runTests('testcafe-fixtures/index.js', 'nested client function selector', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector([function])
                        |   .withText('loren')
                        |   .filter([function])
                      > |   .filter([function])
                        |   .filterVisible()
                `);
            });
    });

    it('nth', function () {
        return runTests('testcafe-fixtures/index.js', 'nth', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                      > |   .nth(500)
                `);
            });
    });

    it('nth in collectionMode', function () {
        return runTests('testcafe-fixtures/index.js', 'nth in collectionMode', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                      > |   .nth(500)
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                `);
            });
    });

    it('filterVisible', function () {
        return runTests('testcafe-fixtures/index.js', 'filterVisible', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '1')
                      > |   .filterVisible()
                        |   .nth(0)
                `);
            });
    });

    it('filterHidden', function () {
        return runTests('testcafe-fixtures/index.js', 'filterHidden', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '3')
                      > |   .filterHidden()
                        |   .nth(0)
                `);
            });
    });

    it('withAttribute', function () {
        return runTests('testcafe-fixtures/index.js', 'withAttribute', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                      > |   .withAttribute('attr', '4')
                        |   .filterVisible()
                        |   .nth(0)
                    `);
            });
    });

    it('root', function () {
        return runTests('testcafe-fixtures/index.js', 'root', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                      > | Selector('divf')
                        |   .filter('.filtered')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                        |   .nth(500)
                `);
            });
    });

    it('parent', function () {
        return runTests('testcafe-fixtures/index.js', 'parent', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .find('div.parent > div')
                        |   .nextSibling()
                      > |   .parent('span')
                        |   .child('p')
                `);
            });
    });

    it('snapshot', function () {
        return runTests('testcafe-fixtures/index.js', 'snapshot', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.
                      > | Selector('ul li')
                        |   .filter('test')
                `);
            });
    });

    it('custom DOM properties', function () {
        return runTests('testcafe-fixtures/index.js', 'custom DOM properties', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.
                      > | Selector('ul li')
                `);
            });
    });

    it('custom methods', function () {
        return runTests('testcafe-fixtures/index.js', 'custom methods', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                      > |   .customFilter('1', 2, { key: 'value' }, /regexp/, [function])
                        |   .withText('loren')
                `);
            });
    });

    it('with - failed before', function () {
        return runTests('testcafe-fixtures/index.js', 'with - failed before', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                      > | Selector('non-existing-element')
                        |   .with({ timeout: 100 })
                        |   .find('ul')
                `);
            });
    });

    it('with - failed after', function () {
        return runTests('testcafe-fixtures/index.js', 'with - failed after', { selectorTimeout: 100, shouldFail: true })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .with({ timeout: 100 })
                      > |   .find('non-existing-element')
                `);
            });
    });
});
