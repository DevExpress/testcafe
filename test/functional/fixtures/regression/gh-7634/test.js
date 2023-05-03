const { join }                   = require('path');
const { homedir }                = require('os');
const fs                         = require('fs');
const { expect }                 = require('chai');
const { onlyInNativeAutomation } = require('../../../utils/skip-in');

const DOWNLOADED_FILE_PATH = join(homedir(), 'Downloads', 'empty.zip');
const EXPECTED_FILE_SIZE   = 144;

describe('Download a file using the Native Automation mode', function () {
    onlyInNativeAutomation('Download a file using the Native Automation mode', function () {
        return runTests('testcafe-fixtures/index.js')
            .then(() => {
                const fileStat = fs.fstatSync(fs.openSync(DOWNLOADED_FILE_PATH));

                expect(fileStat.size).eql(EXPECTED_FILE_SIZE);

                fs.rmSync(DOWNLOADED_FILE_PATH);
            });
    });
});


