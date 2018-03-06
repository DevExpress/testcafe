var expect = require('chai').expect;

var DEFAULT_SELECTOR_TIMEOUT   = 3000;
var DEFAULT_RUN_OPTIONS        = { selectorTimeout: DEFAULT_SELECTOR_TIMEOUT };
var DEFAULT_CHROME_RUN_OPTIONS = { only: 'chrome', selectorTimeout: DEFAULT_SELECTOR_TIMEOUT };

describe('[API] Selector', function () {
    it('Should provide basic properties in HTMLElement snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'HTMLElement snapshot basic properties', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide basic properties in SVGElement snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'SVGElement snapshot basic properties', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide input-specific properties in element snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Input-specific element snapshot properties', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide `innerText` property in element snapshots', function () {
        return runTests('./testcafe-fixtures/selector-test.js', '`innerText` element snapshot property', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide node snapshots for non-element nodes', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Non-element node snapshots', DEFAULT_RUN_OPTIONS);
    });

    it('Should accept string as constructor argument', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'String ctor argument', DEFAULT_RUN_OPTIONS);
    });

    it('Should wait for element to appear in DOM', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Wait for element in DOM', DEFAULT_RUN_OPTIONS);
    });

    it('Should return `null` if element does not appear within given time', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Element does not appear', { selectorTimeout: 300 });
    });

    it('Should check element visibility if option is enabled', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Visibility check', DEFAULT_RUN_OPTIONS);
    });

    it('Should use timeout specified via property', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Timeout', { selectorTimeout: 4000 });
    });

    it('Should provide "selector" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `selector` method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide "hasClass" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot `hasClass` method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide "addCustomDOMProperties" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `addCustomDOMProperties` method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide "addCustomMethods" method in node snapshot', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `addCustomMethods` method', DEFAULT_RUN_OPTIONS);
    });

    it('Selector `addCustomMethods` method - Selector mode', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `addCustomMethods` method - Selector mode', DEFAULT_RUN_OPTIONS);
    });

    it('Should wait for element to appear on new page', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Element on new page', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide snapshot property shorthands on selector', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Snapshot properties shorthands on selector', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter results with `nth()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "nth()" method', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter results with `withText()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "withText" method', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter results with `withExactText()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "withExactText" method', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter results with `withAttribute()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "withAttribute" method', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter results with `filter()` method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "filter" method', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should filter using combination of filter methods', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Combination of filter methods', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should provide methods for filtering by visibility for plain structure of HTML elements', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `filterVisible/filterHidden` methods with plain structure', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide methods for filtering by visibility for hierarchical structure of HTML elements', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector `filterVisible/filterHidden` methods with hierarchical structure', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .find() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "find" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .parent() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "parent" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .child() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "child" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .sibling() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "sibling" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .nextSibling() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "nextSibling" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide .prevSibling() method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "prevSibling" method', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide "exists" and "count" properties', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector "count" and "exists" properties', DEFAULT_RUN_OPTIONS);
    });

    it('Should provide dependencies and index argument to selector filter', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector filter dependencies and index argument', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should provide filter origin argument', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Selector filter origin node argument', DEFAULT_CHROME_RUN_OPTIONS);
    });

    it('Should provide hasAttribute method', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'hasAttribute method', DEFAULT_RUN_OPTIONS);
    });

    describe('Errors', function () {
        it('Should handle errors in Selector code', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Error in code', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('An error occurred in Selector code:');
                    expect(errs[0]).contains('Error: Hey ya!');
                    expect(errs[0]).contains('> 11 |    await selector();');
                });
        });

        it('Should raise error if non-DOM node returned', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Return non-DOM node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Function that specifies a selector can only return a DOM node, an array of nodes, ' +
                        'NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.'
                    );
                    expect(errs[0]).contains("> 15 |    await Selector(() => 'hey')();");
                });
        });

        it('Should raise an error if Selector ctor argument is not a function or string', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Selector fn is not a function or string', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'Selector is expected to be initialized with a function, CSS selector string, another Selector, ' +
                    'node snapshot or a Promise returned by a Selector, but number was passed.'
                )).eql(0);

                expect(errs[0]).contains('> 19 |    await Selector(123)();');
            });
        });

        it("Should raise error if snapshot property shorthand can't find element in DOM tree", function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', "Snapshot property shorthand - selector doesn't match any element", {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.'
                    );
                    expect(errs[0]).contains("> 23 |    await Selector('#someUnknownElement').tagName;");
                });
        });

        it("Should raise error if snapshot shorthand method can't find element in DOM tree", function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', "Snapshot shorthand method - selector doesn't match any element", {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.'
                    );
                    expect(errs[0]).contains("> 27 |    await Selector('#someUnknownElement').getStyleProperty('width');");
                });
        });

        it('Should raise error if error occurs in selector during shorthand property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Snapshot property shorthand - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains('> 31 |    await Selector(() => [].someUndefMethod()).nodeType;');
                });
        });

        it('Should raise error if error occurs in selector during shorthand method evaluation', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Snapshot shorthand method - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains("> 35 |    await Selector(() => [].someUndefMethod()).hasClass('yo');");
                });
        });

        it('Should raise error if error occurs in selector during "count" property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Snapshot "count" property - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );

                    expect(errs[0]).contains('> 39 |    await Selector(() => [].someUndefMethod()).count;');
                });
        });

        it('Should raise error if error occurs in selector during "exists" property evaluation', function () {
            return runTests('./testcafe-fixtures/selector-error-test.js', 'Snapshot "exists" property - selector error', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'An error occurred in Selector code:'
                    );
                    expect(errs[0]).contains('> 43 |    await Selector(() => [].someUndefMethod()).exists;');
                });
        });

        it('Should raise error if custom DOM property throws an error',
            function () {
                return runTests('./testcafe-fixtures/selector-error-test.js', 'Add custom DOM properties method - property throws an error', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).contains(
                            'An error occurred when trying to calculate a custom Selector property "prop":  Error: test'
                        );
                        expect(errs[0]).contains('> 53 |    await el();');
                    });
            }
        );

        it('Should raise error if custom method throws an error',
            function () {
                return runTests('./testcafe-fixtures/selector-error-test.js', 'Add custom method - method throws an error', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).contains(
                            'An error occurred in customMethod code:  Error: test'
                        );
                        expect(errs[0]).contains('> 63 |    await el.customMethod();');
                    });
            }
        );

        it('Should raise error if custom method throws an error - Selector mode',
            function () {
                return runTests('./testcafe-fixtures/selector-error-test.js', 'Add custom method - method throws an error - Selector mode', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).contains(
                            'An error occurred in Selector code:  Error: test'
                        );
                        expect(errs[0]).contains('> 73 |    await el.customMethod()();');
                    });
            }
        );
    });

    describe('Regression', function () {
        it("Should execute successfully if derivative selector doesn't have options (GH-716)", function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Derivative selector without options', DEFAULT_CHROME_RUN_OPTIONS);
        });

        it('Should select <option> element by text in Firefox (GH-861)', function () {
            return runTests('./testcafe-fixtures/selector-test.js', '<option> text selector', {
                only:            'firefox',
                selectorTimeout: 3000
            });
        });
    });
});
