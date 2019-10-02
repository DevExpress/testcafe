const Module = require('module');
const expect = require('chai').expect;

const createExecutionContext = require('../../lib/api/test-controller/execution-context').createExecutionContext;

describe('createExecutionContext', () => {
    const { createRequire, createRequireFromPath } = Module;

    beforeEach(() => {
        Module.createRequireFromPath = null;
        Module.createRequire = null;
    });

    it('should calculate paths for modules', () => {
        const testRun = {
            test: { testFile: { filename: `${process.cwd()}/test/server/data/execution-context/fixture.testcafe` } }
        };

        let context = createExecutionContext(testRun);

        expect(context.require('module-for-test')()).to.be.true;

        testRun.test.testFile.filename = `${process.cwd()}/test/server/data/execution-context/fixtures/fixture.testcafe`;
        context = createExecutionContext(testRun);

        expect(context.require('module-for-test')()).to.be.true;
    });

    afterEach(() => {
        Module.createRequireFromPath = createRequireFromPath;
        Module.createRequire = createRequire;
    });
});
