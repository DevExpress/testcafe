const { expect } = require('chai');

const EXPECTED_EXECUTED_TEST_NAMES = ['1', '2', '3'];

module.exports = class ExecutedTestInfo {
    constructor () {
        this.clear();
    }

    clear () {
        this.testNames = [];
        this.errs      = [];
        this.warnings  = [];
    }

    onTestDone (name, testRunInfo) {
        this.testNames.push(name);
        this.errs.push(...testRunInfo.errs);
    }

    onTaskDone (warnings) {
        this.warnings.push(...warnings);
    }

    check () {
        expect(this.testNames).eql(EXPECTED_EXECUTED_TEST_NAMES);
        expect(this.errs.length).eql(0);
        expect(this.warnings[0]).contain(
            "An asynchronous method that you do not await includes an assertion. Inspect that method's execution chain and add the 'await' keyword where necessary." + '\n\n' +
            '   1 |import { t } from \'testcafe\';' + '\n' +
            '   2 |' + '\n' +
            '   3 |export default async function methodWithFailedAssertion () {' + '\n' +
            ' > 4 |    await t.expect(1).eql(2);' + '\n' +
            '   5 |}' + '\n' +
            '   6 |');
    }
};
