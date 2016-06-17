var expect                     = require('chai').expect;


describe('[API] Drag actions', function () {
    describe('t.drag', function () {
        it('Should drag an element by an offset', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Drag to offset completed successfully');
                    expect(errs[0]).to.contain('>  7 |    await t.drag(\'#draggable-div-1\'');
                });
        });

        it('Should validate selector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect selector', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Action selector error:  Selector code is expected to be specified as a function or string, but "object" was passed.');
                    expect(errs[0]).to.contain('> 14 |    await t.drag({}, 10, 20);');
                });
        });

        it('Should validate dragOffsetX', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect dragOffsetX', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The dragOffsetX argument is expected to be an integer, but it was NaN.');
                    expect(errs[0]).to.contain('> 18 |    await t.drag(\'#draggable-div-1\', NaN, 20);');
                });
        });

        it('Should validate dragOffsetY', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect dragOffsetY', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The dragOffsetY argument is expected to be an integer, but it was 3.14.');
                    expect(errs[0]).to.contain('> 22 |    await t.drag(\'#draggable-div-1\', 10, 3.14);');
                });
        });

        it('Should validate action options', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to offset with incorrect action option', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The offsetX option is expected to be a positive integer, but it was string.');
                    expect(errs[0]).to.contain('> 26 |    await t.drag(\'#draggable-div-1\', 10, 20, { offsetX: \'test\' });');
                });
        });
    });

    describe('t.dragToElement', function () {
        it('Should drag an element to another element', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Drag to element completed successfully');
                    expect(errs[0]).to.contain('> 30 |    await t.dragToElement(\'#draggable-div-2\', \'#destination-div\'');
                });
        });

        it('Should validate selector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect selector', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('Action selector error:  Selector code is expected to be specified as a function or string, but "undefined" was passed.');
                    expect(errs[0]).to.contain('> 37 |    await t.dragToElement(void 0, \'#destination-div\');');
                });
        });

        it('Should validate destinationSelector', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect destinationSelector', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The destinationSelector argument is expected to be a string, but it was object.');
                    expect(errs[0]).to.contain('> 41 |    await t.dragToElement(\'#draggable-div-2\', null);');
                });
        });

        it('Should validate action options', function () {
            return runTests('./testcafe-fixtures/drag-test.js', 'Drag to element with incorrect action option', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contain('The modifiers.shift option is expected to be a boolean value, but it was number.');
                    expect(errs[0]).to.contain('> 45 |    await t.dragToElement(\'#draggable-div-2\', \'#destination-div\'');
                });
        });
    });
});
