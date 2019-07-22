import { stat as statCb } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { promisify } from 'util';
import timeLimit from 'time-limit-promise';
import del from 'del';
import delay from '../../../../../../lib/utils/delay';


const DOWNLOADED_FILE_PATH  = join(homedir(), 'Downloads', 'package.json');
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

fixture `gh3127`
    .page `http://localhost:3000/fixtures/regression/gh-3127/pages/index.html`
    .beforeEach(() => del(DOWNLOADED_FILE_PATH, { force: true }))
    .after(() => del(DOWNLOADED_FILE_PATH, { force: true }));


test('Download a file', async t => {
    await t.click('#link');

    await waitForFileWithTimeout(DOWNLOADED_FILE_PATH, 20000);
});
