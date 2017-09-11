var expect = require('chai').expect;


describe('[API] Drag actions', function () {
    describe('t.drag', function () {
        it('Should drag an element by an offset', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Drag to offset completed successfully');
                    expect(errs[0]).to.contain('>  9 |    await t.drag(\'#draggable-div-1\'');
                });
        });

        it('Should validate selector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect selector', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but object was passed.'
                    );
                    expect(errs[0]).to.contain('> 16 |    await t.drag({}, 10, 20);');
                });
        });

        it('Should validate dragOffsetX', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect dragOffsetX', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The "dragOffsetX" argument is expected to be an integer, but it was NaN.');
                    expect(errs[0]).to.contain('> 20 |    await t.drag(\'#draggable-div-1\', NaN, 20);');
                });
        });

        it('Should validate dragOffsetY', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect dragOffsetY', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The "dragOffsetY" argument is expected to be an integer, but it was 3.14.');
                    expect(errs[0]).to.contain('> 24 |    await t.drag(\'#draggable-div-1\', 10, 3.14);');
                });
        });

        it('Should validate action options', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect action option', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The "offsetX" option is expected to be an integer, but it was string.');
                    expect(errs[0]).to.contain('> 28 |    await t.drag(\'#draggable-div-1\', 10, 20, { offsetX: \'test\' });');
                });
        });
    });

    describe('t.dragToElement', function () {
        it('Should drag an element to another element', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Drag to element completed successfully');
                    expect(errs[0]).to.contain('> 32 |    await t.dragToElement(\'#draggable-div-2\', \'#destination-div\'');
                });
        });

        it('Should validate selector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect selector', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but undefined was passed.'
                    );
                    expect(errs[0]).to.contain('> 39 |    await t.dragToElement(void 0, \'#destination-div\');');
                });
        });

        it('Should validate destinationSelector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect destinationSelector', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain(
                        'Action "destinationSelector" argument error:  Selector is expected to be initialized ' +
                        'with a function, CSS selector string, another Selector, node snapshot or a Promise ' +
                        'returned by a Selector, but object was passed.'
                    );
                    expect(errs[0]).to.contain('> 43 |    await t.dragToElement(\'#draggable-div-2\', null);');
                });
        });

        it('Should validate action options', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect action option', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The "modifiers.shift" option is expected to be a boolean value, but it was number.');
                    expect(errs[0]).to.contain('> 47 |    await t.dragToElement(\'#draggable-div-2\', \'#destination-div\'');
                });
        });

        it("Should validate node type of element that destinationElement's selector returns", function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Destination element selector returns text node', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The element that matches the specified "destinationSelector" is not visible.');
                    expect(errs[0]).to.contains(' > 55 |    await t.dragToElement(\'#draggable-div-2\', getDocument);');
                });
        });

        it('Should take into account destination offsets', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with destination offsets');
        });
    });

    describe('html5 drag and drop', function () {
        it('Should raise drag and drop events', function () {
            return runTests('./testcafe-fixtures/drag-and-drop-test.js', 'drag and drop', { skip: ['iphone', 'ipad', 'android'] });
        });

        it('Should check is element draggable', function () {
            return runTests('./testcafe-fixtures/drag-and-drop-test.js', 'try to drag undraggable', { skip: ['iphone', 'ipad', 'android'] });
        });

        it('Should check is element droppable', function () {
            return runTests('./testcafe-fixtures/drag-and-drop-test.js', 'try to drop to undroppable', { skip: ['iphone', 'ipad', 'android'] });
        });

        it('Should reproduce native browser behavior', function () {
            return runTests('./testcafe-fixtures/drag-and-drop-test.js', 'drag link and image', { only: ['chrome'] });
        });
    });
});
