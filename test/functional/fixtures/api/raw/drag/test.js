var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

describe('[Raw API] Drag actions', function () {
    describe('drag', function () {
        it('Should drag an element by an offset', function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag to offset', { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Drag to offset completed successfully', 0);
                });
        });
    });

    describe('drag-to-element', function () {
        it('Should drag an element to another element', function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag to element', { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Drag to element completed successfully', 0);
                });
        });

        it("Should fail if a dragged element doesn't exist", function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag non-existent element to another element', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).eql('The specified selector does not match any element in the DOM tree.  ' +
                                        '[[Drag non-existent element to another element callsite]]');
                });
        });

        it('Should fail if a dragged element is invisible', function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag invisible element to another element', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).eql('The element that matches the specified selector is not visible.  ' +
                                        '[[Drag invisible element to another element callsite]]');
                });
        });

        it("Should fail if a destination element doesn't exist", function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag to non-existent element', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).eql('The specified destination selector does not match any element in the DOM tree.  ' +
                                        '[[Drag to non-existent element callsite]]');
                });
        });

        it('Should fail if a destination element is invisible', function () {
            return runTests('./testcafe-fixtures/drag.testcafe', 'Drag to invisible element', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).eql('The element that matches the specified destination selector is not visible.  ' +
                                        '[[Drag to invisible element callsite]]');
                });
        });
    });
});
