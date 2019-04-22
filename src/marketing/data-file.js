import path from 'path';
import os from 'os';
import makeDir from 'make-dir';
import { stat, writeFile, readFile, deleteFile } from '../utils/promisified-functions';
import renderTemplate from '../utils/render-template';
import debug from 'debug';
import WARNING_MESSAGES from '../notifications/warning-message';

const MARKETING_DATA_DIR  = path.join(os.tmpdir(), 'testcafe-marketing');
const MARKETING_DATA_FILE = 'data-file.json';

const DEBUG_LOGGER = debug('testcafe:marketing');

export default class DataFile {
    constructor () {
        this.dataDir  = MARKETING_DATA_DIR;
        this.dataPath = path.join(MARKETING_DATA_DIR, MARKETING_DATA_FILE);
    }

    async _exists () {
        try {
            await stat(this.dataPath);

            return true;
        }
        catch (e) {
            return false;
        }
    }

    static _createTemplate () {
        return {
            runCount:              0,
            displayedMessageIndex: 0
        };
    }

    async _save (data) {
        await writeFile(this.dataPath, JSON.stringify(data));
    }

    async _load () {
        const fileContent = await readFile(this.dataPath);

        return JSON.parse(fileContent);
    }

    async load () {
        try {
            await makeDir(this.dataDir);

            let content = null;

            if (!await this._exists()) {
                content = DataFile._createTemplate();

                await this._save(content);
            }
            else
                content = await this._load();

            return content;
        }
        catch (e) {
            const message = renderTemplate(WARNING_MESSAGES.cannotLoadMarketingData, e);

            DEBUG_LOGGER(message);

            return null;
        }
    }

    async save (data) {
        try {
            await this._save(data);
        }
        catch (e) {
            const message = renderTemplate(WARNING_MESSAGES.cannotSaveMarketingData, e);

            DEBUG_LOGGER(message);
        }
    }

    // NOTE: For testing purposes
    async _remove () {
        try {
            await deleteFile(this.dataPath);
        }
        catch (e) { // eslint-disable-line no-empty
        }
    }
}
