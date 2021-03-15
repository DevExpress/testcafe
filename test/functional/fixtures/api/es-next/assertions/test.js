const expect             = require('chai').expect;
const fs                 = require('fs');
const path               = require('path');
const escapeStringRegExp = require('escape-string-regexp');
const WARNING_MESSAGES   = require('../../../../../../lib/notifications/warning-message');

const DATA_PATH = path.join(__dirname, './data');

function createRegExp (message) {
    return new RegExp(escapeStringRegExp(message));
}

function createRegExpFromFile (fileName) {
    return createRegExp(fs.readFileSync(path.join(DATA_PATH, fileName)).toString().replace(/\r/g, ''));
}

const snapshotWarningRegExp = createRegExp(WARNING_MESSAGES.excessiveAwaitInAssertion);

function getSnapshotWarnings () {
    return testReport.warnings.filter(warningStr => {
        return warningStr.match(snapshotWarningRegExp);
    });
}

describe('[API] Assertions', function () {
    it('Should perform .eql() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.eql() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: testMessage: expected 'hey' to deeply equal 'yo'");
                expect(errs[0]).contains(">  8 |        .expect('hey').eql('yo', 'testMessage');");
            });
    });

    it('Should perform .notEql() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notEql() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2 to not deeply equal 2');
                expect(errs[0]).contains('> 14 |        .expect(2).notEql(2);');
            });
    });

    it('Should perform .ok() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.ok() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected false to be truthy');
                expect(errs[0]).contains('> 20 |        .expect(false).ok();');
            });
    });

    it('Should perform .notOk() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notOk() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 1 to be falsy ');
                expect(errs[0]).contains('> 26 |        .expect(1).notOk();');
            });
    });

    it('Should perform .contains() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.contains() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected [ 1, 2, 3 ] to include 4');
                expect(errs[0]).contains('> 32 |        .expect([1, 2, 3]).contains(4);');
            });
    });

    it('Should perform .notContains() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notContains() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'answer42' to not include '42'");
                expect(errs[0]).contains("> 38 |        .expect('answer42').notContains('42');");
            });
    });

    it('Should perform .typeOf() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.typeOf() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be a function');
                expect(errs[0]).contains("> 51 |        .expect(42).typeOf('function');");
            });
    });

    it('Should perform .notTypeOf() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notTypeOf() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 not to be a number');
                expect(errs[0]).contains("> 64 |        .expect(42).notTypeOf('number');");
            });
    });

    it('Should perform .gt() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.gt() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be above 42');
                expect(errs[0]).contains('> 70 |        .expect(42).gt(42);');
            });
    });

    it('Should perform .gte() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.gte() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be at least 53');
                expect(errs[0]).contains('> 77 |        .expect(42).gte(53);');
            });
    });

    it('Should perform .lt() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.lt() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be below 42');
                expect(errs[0]).contains('> 83 |        .expect(42).lt(42);');
            });
    });

    it('Should perform .lte() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.lte() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 42 to be at most 12');
                expect(errs[0]).contains('> 90 |        .expect(42).lte(12);');
            });
    });

    it('Should perform .within() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.within() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 4.5 to be within 4.6..7');
                expect(errs[0]).contains('>  96 |        .expect(4.5).within(4.6, 7);');
            });
    });

    it('Should perform .notWithin() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notWithin() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('AssertionError: expected 2.3 to not be within 2..3');
                expect(errs[0]).contains('> 102 |        .expect(2.3).notWithin(2, 3);');
            });
    });

    it('Should perform .match() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.match() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'yo' to match /[x,z]o/");
                expect(errs[0]).contains("> 156 |        .expect('yo').match(/[x,z]o/);");
            });
    });

    it('Should perform .notMatch() assertion', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '.notMatch() assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected '42 hey' not to match /\\d+ hey/");
                expect(errs[0]).contains("> 162 |        .expect('42 hey').notMatch(/\\d+ hey/);");
            });
    });

    it('Should raise a warning when trying to assert Selector instance', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Passing Selector instance into an assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function () {
                expect(testReport.warnings[0]).to.match(createRegExp(WARNING_MESSAGES.assertedSelectorInstance));
            });
    });

    it('Should raise a warning when trying to assert ClientFunction instance', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Passing ClientFunction instance into an assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function () {
                expect(testReport.warnings[0]).to.contain(
                    'You passed a ClientFunction object to \'t.expect()\'.\n' +
                    'If you want to check the function\'s return value, use parentheses to call the function: fnName().'
                );
            });
    });

    it('Should raise a warning when trying to await Selector property in assertion', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Await Selector property', { only: 'chrome' });

        expect(getSnapshotWarnings().length).to.eql(1);
        expect(getSnapshotWarnings()[0]).to.match(createRegExpFromFile('expected-selector-property-awaited-callsite'));
    });

    it('Should raise a warning when using DOM Node snapshot property without await', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Snapshot property without await', { only: 'chrome' });

        const missingAwaitWarningRegExp = createRegExp(WARNING_MESSAGES.missingAwaitOnSnapshotProperty);

        const missingAwaitWarnings = testReport.warnings.filter(warningStr => {
            return warningStr.match(missingAwaitWarningRegExp);
        });

        expect(missingAwaitWarnings.length).to.eql(2);
        expect(missingAwaitWarnings[0]).to.match(createRegExpFromFile('expected-missing-await-on-snapshot-callsite/console-log'));
        expect(missingAwaitWarnings[1]).to.match(createRegExpFromFile('expected-missing-await-on-snapshot-callsite/template-expansion'));
    });

    it('Console.log for promise which will be resolved', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Console.log for promise which will be resolved', { only: 'chrome' });

        const missingAwaitWarningRegExp = createRegExp(WARNING_MESSAGES.missingAwaitOnSnapshotProperty);

        const missingAwaitWarnings = testReport.warnings.filter(warningStr => {
            return warningStr.match(missingAwaitWarningRegExp);
        });

        expect(missingAwaitWarnings.length).to.eql(1);
    });

    it('Convert for promise which will be resolved', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Convert for promise which will be resolved', { only: 'chrome' });

        const missingAwaitWarningRegExp = createRegExp(WARNING_MESSAGES.missingAwaitOnSnapshotProperty);

        const missingAwaitWarnings = testReport.warnings.filter(warningStr => {
            return warningStr.match(missingAwaitWarningRegExp);
        });

        expect(missingAwaitWarnings.length).to.eql(1);
    });

    it('Should not raise a warning when using DOM Node snapshot property without await in assignment', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Snapshot property without await but valid', { only: 'chrome' });

        expect(testReport.warnings).be.empty;
    });

    it('Should not raise a warning when reusing selector property assertions from a function', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Reused unawaited selector property assertion from a function', { only: 'chrome' });

        expect(testReport.warnings).be.empty;
    });

    it('Should only raise one warning when reusing awaited selector property assertions from a function', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Reused awaited selector property assertion from a function', { only: 'chrome' });

        expect(getSnapshotWarnings().length).to.eql(1);
        expect(getSnapshotWarnings()[0]).contains("> 238 |        await t.expect(await selector.innerText).eql('');");
    });

    it('Should not raise a warning when reusing selector property assertions in a loop', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Reused unawaited selector property assertion in a loop', { only: 'chrome' });

        expect(testReport.warnings).be.empty;
    });

    it('Should only raise one warning when reusing awaited selector property assertions in a loop', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Reused awaited selector property assertion in a loop', { only: 'chrome' });

        expect(getSnapshotWarnings().length).to.eql(1);
        expect(getSnapshotWarnings()[0]).contains("> 253 |        await t.expect(await Selector('#el1').innerText).eql('');");
    });

    it('Should raise multiple warnings when awaiting multiple selector properties in one assertion', async function () {
        await runTests('./testcafe-fixtures/assertions-test.js', 'Multiple awaited selector properties in one assertion', { only: 'chrome' });

        expect(getSnapshotWarnings().length).to.eql(2);
        expect(getSnapshotWarnings()[0]).contains("> 259 |    await t.expect(await selector.innerText + await selector.innerText).eql('');");
        expect(getSnapshotWarnings()[1]).contains("> 259 |    await t.expect(await selector.innerText + await selector.innerText).eql('');");
    });

    it('Should retry assertion for selector results', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Selector result assertion', { only: 'chrome' });
    });

    it('Should raise error assertion for selector results assertion on timeout', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Selector result assertion timeout', {
            shouldFail:       true,
            assertionTimeout: 20,
            only:             'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains("AssertionError: expected 'none' to deeply equal 'left'");
                expect(errs[0]).contains("> 124 |        .expect(el.getStyleProperty('float')).eql('left');");
            });
    });

    it('Should raise error when expecting an unawaited Promise that cannot be retried', () => {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Unawaited Promise assertion', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains(`Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.`);
            });
    });

    it('Should allow an unawaited Promise with override option', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Unawaited Promise assertion override', { only: 'chrome' });
    });

    it('Should raise error if `await` is missing', () => {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Missing await', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[1]).contains('A call to an async function is not awaited.');
                expect(errs[1]).contains('> 136 |    t.expect(42).eql(43); 137 |});');
            });
    });

    it('Should raise error if "timeout" option is not a number', () => {
        return runTests('./testcafe-fixtures/assertions-test.js', '"timeout" is not a number', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).contains('The "timeout" option is expected to be a positive integer, but it was string.');
                expect(errs[0]).contains("> 140 |    await t.expect(42).eql(43, { timeout: 'hey' });");
            });
    });

    it('Should provide "timeout" option', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', '"timeout" option', {
            only:             'chrome',
            assertionTimeout: 0
        });
    });

    it('Should retry assertion for ClientFunction results', function () {
        return runTests('./testcafe-fixtures/assertions-test.js', 'ClientFunction result assertion', { only: 'chrome' });
    });

    it('Should raise an error if assertion was called without method', () => {
        return runTests('./testcafe-fixtures/assertions-test.js', 'Assertion without method call',
            { shouldFail: true, only: 'chrome' })
            .catch(errs => {
                expect(errs.length).eql(1);
                expect(errs[0]).to.contains('An assertion method is not specified.');
                expect(errs[0]).to.contains('> 172 |    await t.expect();');
            });
    });
});
