import { stat as statCb } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { promisify } from 'util';
import timeLimit from 'time-limit-promise';
import del from 'del';
import delay from '../../../../../../lib/utils/delay';


const DOWNLOADED_ZIP_FILE_PATH  = join(homedir(), 'Downloads', 'dummy.zip');
const DOWNLOADED_PDF_FILE_PATH  = join(homedir(), 'Downloads', 'dummy.pdf');
const FILE_CHECK_INTERVAL   = 3000;

const stat = promisify(statCb);

async function isFile (path) {
    try {
        const stats = await stat(path);

        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}

async function waitForFile (path) {
    while (!await isFile(path))
        await delay(FILE_CHECK_INTERVAL);
}

async function waitForFileWithTimeout (path, ms) {
    await timeLimit(waitForFile(path), ms, { rejectWith: new Error('Timed out when waiting for a file') });
}

function deleteFiles () {
    del(DOWNLOADED_ZIP_FILE_PATH, { force: true });
    del(DOWNLOADED_PDF_FILE_PATH, { force: true });
}

fixture `GH-2741 - Download files in FF`
    .page `http://localhost:3000/fixtures/regression/gh-2741/pages/index.html`
    .beforeEach(deleteFiles)
    .after(deleteFiles);


test('ZIP', async t => {
    await t.click('#zip');

    await waitForFileWithTimeout(DOWNLOADED_ZIP_FILE_PATH, 20000);
});

test('PDF', async t => {
    await t.click('#pdf');

    await waitForFileWithTimeout(DOWNLOADED_PDF_FILE_PATH, 20000);
});
