const expect = require('chai').expect;

describe('[Regression](GH-2568)', function () {
    it('nested selector', function () {
        return runTests('testcafe-fixtures/index.js', 'nested selector', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div>>>.filter(\'.non-existing-class\').filterVisible()" does not match any element in the DOM tree.');
            });
    });

    it('client function selector', function () {
        return runTests('testcafe-fixtures/index.js', 'client function selector', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector ">>>[function].filterVisible()" does not match any element in the DOM tree.');
            });
    });

    it('nested client function selector', function () {
        return runTests('testcafe-fixtures/index.js', 'nested client function selector', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "[function].withText(\'loren\').filter([function])>>>.filter([function]).filterVisible()" does not match any element in the DOM tree.');
            });
    });


    it('nth', function () {
        return runTests('testcafe-fixtures/index.js', 'nth', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\').withText(\'loren\').withExactText(\'loren ipsum\').withAttribute(\'attr\', \'3\').filterVisible()>>>.nth(500)" does not match any element in the DOM tree.');
            });
    });

    it('filterVisible', function () {
        return runTests('testcafe-fixtures/index.js', 'filterVisible', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\').withText(\'loren\').withExactText(\'loren ipsum\').withAttribute(\'attr\', \'1\')>>>.filterVisible().nth(0)" does not match any element in the DOM tree.');
            });
    });

    it('filterHidden', function () {
        return runTests('testcafe-fixtures/index.js', 'filterHidden', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\').withText(\'loren\').withExactText(\'loren ipsum\').withAttribute(\'attr\', \'3\')>>>.filterHidden().nth(0)" does not match any element in the DOM tree.');
            });
    });

    it('withAttribute', function () {
        return runTests('testcafe-fixtures/index.js', 'withAttribute', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\').withText(\'loren\').withExactText(\'loren ipsum\')>>>.withAttribute(\'attr\', \'4\').filterVisible().nth(0)" does not match any element in the DOM tree.');
            });
    });

    it('withExactText', function () {
        return runTests('testcafe-fixtures/index.js', 'withExactText', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\').withText(\'loren\')>>>.withExactText(\'loren ipsums\').withAttribute(\'attr\', \'3\').filterVisible().nth(500)" does not match any element in the DOM tree.');
            });
    });

    it('withText', function () {
        return runTests('testcafe-fixtures/index.js', 'withText', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div.filter(\'.filtered\')>>>.withText(\'lorenps\').withExactText(\'loren ipsums\').withAttribute(\'attr\', \'3\').filterVisible().nth(500)" does not match any element in the DOM tree.');
            });
    });

    it('filter', function () {
        return runTests('testcafe-fixtures/index.js', 'filter', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "div>>>.filter(\'.filteredddddd\').withText(\'loren\').withExactText(\'loren ipsum\').withAttribute(\'attr\', \'3\').filterVisible().nth(500)" does not match any element in the DOM tree.');
            });
    });

    it('root', function () {
        return runTests('testcafe-fixtures/index.js', 'root', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector ">>>divf.filter(\'.filtered\').withText(\'loren\').withExactText(\'loren ipsum\').withAttribute(\'attr\', \'3\').filterVisible().nth(500)" does not match any element in the DOM tree.');
            });
    });

    it('child', function () {
        return runTests('testcafe-fixtures/index.js', 'child', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body.find(\'div.parent > div\').nextSibling().parent(\'div\')>>>.child(\'p\')" does not match any element in the DOM tree.');
            });
    });

    it('parent', function () {
        return runTests('testcafe-fixtures/index.js', 'parent', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body.find(\'div.parent > div\').nextSibling()>>>.parent(\'span\').child(\'p\')" does not match any element in the DOM tree.');
            });
    });

    it('nextSibling', function () {
        return runTests('testcafe-fixtures/index.js', 'nextSibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body.find(\'div.parent > div:last-child\')>>>.nextSibling().parent(\'div\').child(\'span\')" does not match any element in the DOM tree.');
            });
    });

    it('prevSibling', function () {
        return runTests('testcafe-fixtures/index.js', 'prevSibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body.find(\'div.parent > div:first-child\')>>>.prevSibling().parent(\'div\').child(\'span\')" does not match any element in the DOM tree.');
            });
    });

    it('sibling', function () {
        return runTests('testcafe-fixtures/index.js', 'sibling', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body.find(\'div.parent > div:first-child > div\')>>>.sibling().parent(\'div\').child(\'span\')" does not match any element in the DOM tree.');
            });
    });

    it('find', function () {
        return runTests('testcafe-fixtures/index.js', 'find', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector "body>>>.find(\'div.not-existing\').nextSibling().parent(\'div\').child(\'span\')" does not match any element in the DOM tree.');
            });
    });

    it('drag', function () {
        return runTests('testcafe-fixtures/index.js', 'drag', { selectorTimeout: 100, shouldFail: true, })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified "destinationSelector" : "div.parent>>>.child(\'ul\')" does not match any element in the DOM tree.');
            });
    });
});
