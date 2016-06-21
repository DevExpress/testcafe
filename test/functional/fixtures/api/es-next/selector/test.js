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
        return runTests('./testcafe-fixtures/selector-test.js', 'Wait for element in DOM', { elementAvailabilityTimeout: 2500 });
    });

    it('Should return `null` if element does not appear within given time', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Element does not appear', { elementAvailabilityTimeout: 300 });
    });

    it('Should check element visibility if option is enabled', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Visibility check', { elementAvailabilityTimeout: 2500 });
    });

    it('Should use timeout specified via property', function () {
        return runTests('./testcafe-fixtures/selector-test.js', 'Timeout', { elementAvailabilityTimeout: 4000 });
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

    describe('Errors', function () {
        it('Should handle errors in Selector code', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Error in code', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('An error occurred in Selector code:');
                    expect(errs[0]).contains('Error: Hey ya!');
                    expect(errs[0]).contains('> 213 |    await selector();');
                });
        });

        it('Should raise error if non-DOM node returned', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Return non-DOM node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('Selector can only return a DOM node, null or undefined. Use ClientFunction to return other values.');
                    expect(errs[0]).contains("> 242 |    await Selector(() => 'hey')();");
                });
        });

        it('Should raise an error if Selector ctor argument is not a function or string', function () {
            return runTests('./testcafe-fixtures/selector-test.js', 'Selector fn is not a function or string', {
                shouldFail: true,
                only:       'chrome'
            }).catch(function (errs) {
                expect(errs[0].indexOf(
                    'Selector code is expected to be specified as a function or string, but "number" was passed.'
                )).eql(0);

                expect(errs[0]).contains('> 183 |    await Selector(123)();');
            });
        });
    });
});
