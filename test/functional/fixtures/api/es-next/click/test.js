const expect = require('chai').expect;

//GH-1674
const TEST_DURATION_BOUND = 10000;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] t.click()', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click button', { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                // GH-1674
                expect(testReport.durationMs).below(TEST_DURATION_BOUND);
                expect(errs[0]).to.contains('Button clicked');
                expect(errs[0]).to.contains(
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
                    ' 17 |});' +
                    ' 18 |' +
                    ' 19 |test(\'Click button\', async t => {' +
                    ' > 20 |    await t.click(\'#btn\');' +
                    ' 21 |});' +
                    ' 22 | '
                );
            });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action option', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The "ClickOptions.offsetX" option is expected to be an integer, but it was -3.5.');
                expect(errs[0]).to.contains(
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' > 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
                    ' 17 |});' +
                    ' 18 |' +
                    ' 19 |test(\'Click button\', async t => {' +
                    ' 20 |    await t.click(\'#btn\');' +
                    ' 21 |});'
                );
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Incorrect action selector', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    'Action "selector" argument error:  Cannot initialize a Selector because Selector is number, and not one of the ' +
                    'following: a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.'
                );
                expect(errs[0]).to.contains(
                    '7 |    .page `http://localhost:3000/fixtures/api/es-next/click/pages/index.html`;' +
                    ' 8 |' +
                    ' 9 |const getClickOffset = ClientFunction(() => window.clickOffset);' +
                    ' 10 |' +
                    ' 11 |test(\'Incorrect action selector\', async t => {' +
                    ' > 12 |    await t.click(123);' +
                    ' 13 |});' +
                    ' 14 |' +
                    ' 15 |test(\'Incorrect action option\', async t => {' +
                    ' 16 |    await t.click(\'#btn\', { offsetX: -3.5 });' +
                    ' 17 |});'
                );
            });
    });

    it('Should click at the center of the target if offset options are not specified', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click without offset options');
    });

    it('Should accept function as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Function as selector');
    });

    it('Should accept Selector function as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Selector function as selector');
    });

    it('Should accept node snapshot as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Node snapshot as selector');
    });

    it('Should accept Promise returned by selector as selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Promise returned by selector as selector');
    });

    it('Should handle error in selector', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Error in selector', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('An error occurred in Selector code:  Error: yo');
                expect(errs[0]).to.contains('> 34 |    await t.click(() => {');
            });
    });

    it('Should validate node type of element that selector returns', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Selector returns text node', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The specified selector is expected to match a DOM element, but it matches a text node.');
                expect(errs[0]).to.contains('> 83 |    await t.click(getNode);');
            });
    });

    it('Should show warning that the element was overlapped', async function () {
        await runTests('./testcafe-fixtures/click-test.js', 'Click overlapped element', { only: 'chrome' });

        expect(testReport.warnings[0]).includes(
            'TestCafe cannot interact with the <div class="child1">Text</div> element because another element obstructs it.\n' +
            'When something overlaps the action target, TestCafe performs the action with the topmost element at the original target\'s location.\n' +
            'The following element with a greater z-order replaced the original action target: <div class="child2">...</div>.\n' +
            'Review your code to prevent this behavior.'
        );
        expect(testReport.warnings[0]).match(/>.*await t.click\('.child1'\);/);
    });

    it('Should click on a more than half-shifted element', async function () {
        await runTests('./testcafe-fixtures/click-test.js', 'Click on a more than half-shifted element', { only: 'chrome' });
    });

    it('Should click on an element with overlapped center', async function () {
        await runTests('./testcafe-fixtures/click-test.js', 'Click on an element with overlapped center', { only: 'chrome' });
    });

    it('Click options', function () {
        return runTests('./testcafe-fixtures/click-options.js', null, { only: 'chrome' });
    });

    describe('[Regression](GH-628)', function () {
        it('Should click on an "option" element', function () {
            return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an "option" element');
        });

        it('Should fail if try to click on an "option" element in a closed "select" element', function () {
            return runTests('./testcafe-fixtures/click-on-select-child-test.js', 'Click on an invisible "option" element', {
                shouldFail: true,
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The action target (<option value="Second">Second</option>) is invisible. The parent element (<select id="simple-select">...</select>) is collapsed, and its length is shorter than 2.');
                    expect(errs[0]).to.contains(
                        "> 17 |        .click('[value=Second]');"
                    );
                });
        });
    });

    describe('Hidden reasons', function () {
        const runTestOptions = {
            shouldFail: true,
        };

        it('Should show that element has width: 0 and height: 0', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with width: 0 and height: 0', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element width-height-0">Element...</div>) is too small to be visible: 0px x 0px.`);
                });
        });

        it('Should show that element has width: 0', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with width: 0', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element width-0">Element...</div>) is too small to be visible: 0px x 100px.`);
                });
        });

        it('Should show that element has height: 0', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with height: 0', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element height-0">Element...</div>) is too small to be visible: 100px x 0px.`);
                });
        });

        it('Should show that element has display: none', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with display: none', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element display-none">Element...</div>) is invisible. The value of its 'display' property is 'none'.`);
                });
        });

        it('Should show that element has visibility: hidden', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with visibility: hidden', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element visibility-hidden">Element...</div>) is invisible. The value of its 'visibility' property is 'hidden'.`);
                });
        });

        it('Should show that element has visibility: collapse', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element with visibility: collapse', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element visibility-collapse">Element...</div>) is invisible. The value of its 'visibility' property is 'collapse'.`);
                });
        });

        it('Should show that ancestor has display: none', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element in ancestor with display: none', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element width-height-100"></div>) is invisible. It descends from an element that has the 'display: none' property (<div class="ancestor display-none">...</div>).`);
                });
        });

        it('Should show that ancestor has visibility: hidden', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element in ancestor with visibility: hidden', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element width-height-100"></div>) is invisible. It descends from an element that has the 'visibility: hidden' property (<div class="ancestor visibility-hidden">...</div>).`);
                });
        });

        it('Should show that ancestor has visibility: collapse', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an element in ancestor with visibility: collapse', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<div class="element width-height-100"></div>) is invisible. It descends from an element that has the 'visibility: collapse' property (<div class="ancestor visibility-collapse">...</div>).`);
                });
        });

        it('Should show that select has size less than 2 and is not expended', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on an option in not expended select with size less than 2', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.contains(`The action target (<option>Option</option>) is invisible. The parent element (<select class="select-not-expended">...</select>) is collapsed, and its length is shorter than 2.`);
                });
        });

        it('Should show that map container is not visible', function () {
            return runTests('./testcafe-fixtures/click-on-hidden-elements-test.js', 'Click on a map element with not visible container', runTestOptions)
                .catch(function (errs) {
                    expect(errs[0]).to.match(/The action target \(<area .*>\) is invisible because its container \(<img .*>\) is too small to be visible: 0px x 0px./);
                });
        });
    });
});
