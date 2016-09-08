var expect = require('chai').expect;

describe('[API] Selector', function () {
    it('Should provide basic properties in HTMLElement snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'HTMLElement snapshot basic properties');
    });

    it('Should provide basic properties in SVGElement snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'SVGElement snapshot basic properties');
    });

    it('Should provide input-specific properties in element snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Input-specific element snapshot properties');
    });

    it('Should provide `innerText` property in element snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', '`innerText` element snapshot property');
    });

    it('Should provide node snapshots for non-element nodes', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Non-element node snapshots');
    });

    it('Should accept string as constructor argument', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'String ctor argument');
    });

    it('Should wait for element to appear in DOM', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Wait for element in DOM', { selectorTimeout: 2500 });
    });

    it('Should return `null` if element does not appear within given time', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Element does not appear', { selectorTimeout: 300 });
    });

    it('Should check element visibility if option is enabled', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Visibility check', { selectorTimeout: 2500 });
    });

    it('Should use timeout specified via property', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Timeout', { selectorTimeout: 4000 });
    });

    it('Should provide "selector" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `selector` method');
    });

    it('Should provide "getParentNode" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `getParentNode` method');
    });

    it('Should provide "getChildNode" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `getChildNode` method');
    });

    it('Should provide "getChildElement" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `getChildElement` method');
    });

    it('Should provide "hasClass" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `hasClass` method');
    });

    it('Should provide "extendSnapshot" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `extendSnapshot` method');
    });

    it('Should wait for element to appear on new page', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Element on new page');
    });

    it('Should filter results with "index" options', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "index" option');
    });

    it('Should filter results with "text" options', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "text" option');
    });

    it('Should filter results using compound filter', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Compound filter');
    });

    it('Should provide snapshot property shorthands on selector', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot properties shorthands on selector', { only: 'chrome' });
    });

    it('Should filter results with `nth()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "nth()" method', { only: 'chrome' });
    });

    it('Should filter results with `withText()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "withText" method', { only: 'chrome' });
    });

    it('Should filter results with `filter()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "filter" method', { only: 'chrome' });
    });

    it('Should filter using combination of filter methods', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Combination of filter methods', { only: 'chrome' });
    });

    it('Should provide .find() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "find" method');
    });

    it('Should provide .parent() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "parent" method');
    });

    it('Should provide .child() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "child" method');
    });

    it('Should provide .sibling() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "sibling" method');
    });

    it('Should provide "exists" and "count" properties', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "count" and "exists" properties');
    });

    it('Should provide dependencies and index argument to selector filter', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector filter dependencies and index argument', { only: 'chrome' });
    });

    it('Should provide filter origin argument', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector filter origin node argument', { only: 'chrome' });
    });

    describe('Errors', function () {
        it('Should handle errors in Selector code', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Error in code', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('An error occurred in Selector code:');
                    expect(errs[0]).contains('Error: Hey ya!');
                    expect(errs[0]).contains('> 242 |    await selector();');
                });
        });

        it('Should raise error if non-DOM node returned', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Return non-DOM node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Function that specifies a selector can only return a DOM node, an array of nodes, ' +
                        'NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.'
                    );
                    expect(errs[0]).contains("> 271 |    await Selector(() => 'hey')();");
                });
        });

        it('Should raise an error if Selector ctor argument is not a function or string', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Selector fn is not a function or string', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'Selector is expected to be initialized with a function, CSS selector string, another Selector, ' +
                    'node snapshot or a Promise returned by a Selector, but number was passed.'
                )).eql(0);

                expect(errs[0]).contains('> 212 |    await Selector(123)();');
            });
        });

        it("Should raise error if snapshot property shorthand can't find element in DOM tree", function () {
            return runTests('./testcafe-fixtures/selector-test.js', "Snapshot property shorthand - selector doesn't match any element", {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.'
                    );
                    expect(errs[0]).contains("> 520 |    await Selector('#someUnknownElement').tagName;");
                });
        });

        it("Should raise error if snapshot shorthand method can't find element in DOM tree", function () {
            return runTests('./testcafe-fixtures/selector-test.js', "Snapshot shorthand method - selector doesn't match any element", {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.'
                    );
                    expect(errs[0]).contains("> 524 |    await Selector('#someUnknownElement').getStyleProperty('width');");
                });
        });

        it('Should raise error if snapshot extension argument is not object',
            function () {
                return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot extendSnapshot method - argument is not object', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).contains(
                            '"extendSnapshot" option is expected to be an object, but it was number.'
                        );
                        expect(errs[0]).contains("> 904 |    await Selector('rect').extendSnapshot(42);");
                    });
            }
        );

        it('Should raise error if at least one of snapshot extensions is not function',
            function () {
                return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot extendSnapshot method - extension is not function', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).contains(
                            "extendSnapshot 'field1' is expected to be a function, but it was number"
                        );
                        expect(errs[0]).contains("> 908 |    await Selector('rect').extendSnapshot({ field1: 1, field2: () => 42 });");
                    });
            }
        );

        it('Should raise error if error occurs in selector during shorthand property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot property shorthand - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains('> 528 |    await Selector(() => [].someUndefMethod()).nodeType;');
                });
        });

        it('Should raise error if error occurs in selector during shorthand method evaluation', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot shorthand method - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains("> 532 |    await Selector(() => [].someUndefMethod()).hasClass('yo');");
                });
        });

        it('Should raise error if error occurs in selector during "count" property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot "count" property - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );

                    expect(errs[0]).contains('> 849 |    await Selector(() => [].someUndefMethod()).count;');
                });
        });

        it('Should raise error if error occurs in selector during "exists" property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot "exists" property - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains('> 853 |    await Selector(() => [].someUndefMethod()).exists;');
                });
        });
    });

    describe('Regression', function () {
        it("Should execute successfully if derivative selector doesn't have options (GH-716)", function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Derivative selector without options', { only: 'chrome' });
        });

        it('Should select <option> element by text in Firefox (GH-861)', function () {
            return runTests('./testcafe-fixtures/selector-test.js', '<option> text selector', { only: 'firefox' });
        });
    });
});
