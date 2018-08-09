const expect = require('chai').expect;

function removeWhitespaces (str) {
    return str.replace(/\s/g, '');
}

function assertSelectorCallstack (actual, expected) {
    expect(removeWhitespaces(actual)).contains(removeWhitespaces(expected));
}

describe('[Regression](GH-2568)', function () {
    it('nested selector', function () {
        return runTests('testcafe-fixtures/index.js', 'nested selector', { selectorTimeout: 100, shouldFail: true, })
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
        return runTests('testcafe-fixtures/index.js', 'nested client function selector', { selectorTimeout: 100, shouldFail: true, })
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
        return runTests('testcafe-fixtures/index.js', 'nth', { selectorTimeout: 100, shouldFail: true, })
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

    it('filterVisible', function () {
        return runTests('testcafe-fixtures/index.js', 'filterVisible', { selectorTimeout: 100, shouldFail: true, })
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
        return runTests('testcafe-fixtures/index.js', 'filterHidden', { selectorTimeout: 100, shouldFail: true, })
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
        return runTests('testcafe-fixtures/index.js', 'withAttribute', { selectorTimeout: 100, shouldFail: true, })
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

    it('withExactText', function () {
        return runTests('testcafe-fixtures/index.js', 'withExactText', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                        |   .withText('loren')
                      > |   .withExactText('loren ipsums')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                        |   .nth(500)
                `);
            });
    });

    it('withText', function () {
        return runTests('testcafe-fixtures/index.js', 'withText', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                        |   .filter('.filtered')
                      > |   .withText('lorenps')
                        |   .withExactText('loren ipsums')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                        |   .nth(500)
                `);
            });
    });

    it('filter', function () {
        return runTests('testcafe-fixtures/index.js', 'filter', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('div')
                      > |   .filter('.filteredddddd')
                        |   .withText('loren')
                        |   .withExactText('loren ipsum')
                        |   .withAttribute('attr', '3')
                        |   .filterVisible()
                        |   .nth(500)
                `);
            });
    });

    it('root', function () {
        return runTests('testcafe-fixtures/index.js', 'root', { selectorTimeout: 100, shouldFail: true, })
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

    it('child', function () {
        return runTests('testcafe-fixtures/index.js', 'child', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .find('div.parent > div')
                        |   .nextSibling()
                        |   .parent('div')
                      > |   .child('p')
                `);
            });
    });

    it('parent', function () {
        return runTests('testcafe-fixtures/index.js', 'parent', { selectorTimeout: 100, shouldFail: true, })
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

    it('nextSibling', function () {
        return runTests('testcafe-fixtures/index.js', 'nextSibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .find('div.parent > div:last-child')
                      > |   .nextSibling()
                        |   .parent('div')
                        |   .child('span')
                `);
            });
    });

    it('prevSibling', function () {
        return runTests('testcafe-fixtures/index.js', 'prevSibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .find('div.parent > div:first-child')
                      > |   .prevSibling()
                        |   .parent('div')
                        |   .child('span')
                `);
            });
    });

    it('sibling', function () {
        return runTests('testcafe-fixtures/index.js', 'sibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                        |   .find('div.parent > div:first-child > div')
                      > |   .sibling()
                        |   .parent('div')
                        |   .child('span')
                `);
            });
    });

    it('find', function () {
        return runTests('testcafe-fixtures/index.js', 'find', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified selector does not match any element in the DOM tree.
                        | Selector('body')
                      > |   .find('div.not-existing')
                        |   .nextSibling()
                        |   .parent('div')
                        |   .child('span')
                `);
            });
    });

    it('drag', function () {
        return runTests('testcafe-fixtures/index.js', 'drag', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    The specified "destinationSelector" does not match any element in the DOM tree.
                        | Selector('div.parent')
                      > |   .child('ul')
                `);
            });
    });

    it('snapshot', function () {
        return runTests('testcafe-fixtures/index.js', 'snapshot', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.
                      > | Selector('ul li')
                        |   .filter('test')
                `);
            });
    });

    it('custom DOM properties', function () {
        return runTests('testcafe-fixtures/index.js', 'custom DOM properties', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                assertSelectorCallstack(errs[0], `
                    Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.
                      > | Selector('ul li')
                `);
            });
    });

    it('long selector', function () {
        return runTests('testcafe-fixtures/index.js', 'long selector', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(/Selector\('a+\.\.\.\)/.test(errs[0])).to.be.true;
            });
    });
});
