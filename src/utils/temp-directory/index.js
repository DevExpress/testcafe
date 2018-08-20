import debug from 'debug';
import os from 'os';
import path from 'path';
import setupExitHook from 'async-exit-hook';
import tmp from 'tmp';
import LockFile from './lockfile';
import cleanupProcess from './cleanup-process';
import { ensureDir, readDir } from '../../utils/promisified-functions';


// NOTE: mutable for testing purposes
let TESTCAFE_TMP_DIRS_ROOT = path.join(os.tmpdir(), 'testcafe');

const DEFAULT_NAME_PREFIX    = 'tmp';

const USED_TEMP_DIRS = {};

const DEBUG_LOGGER = debug('testcafe:utils:temp-directory');

export default class TempDirectory {
    constructor (namePrefix) {
        this.namePrefix = namePrefix || DEFAULT_NAME_PREFIX;

        this.path     = '';
        this.lockFile = null;
    }

    async _getTmpDirsList () {
        const tmpDirNames = await readDir(TESTCAFE_TMP_DIRS_ROOT);

        return tmpDirNames
            .filter(tmpDir => !USED_TEMP_DIRS[tmpDir])
            .filter(tmpDir => path.basename(tmpDir).startsWith(this.namePrefix));
    }

    async _findFreeTmpDir (tmpDirNames) {
        for (const tmpDirName of tmpDirNames) {
            const tmpDirPath = path.join(TESTCAFE_TMP_DIRS_ROOT, tmpDirName);

            const lockFile = new LockFile(tmpDirPath);

            if (lockFile.init()) {
                this.path     = tmpDirPath;
                this.lockFile = lockFile;

                return true;
            }
        }

        return false;
    }

    async _createNewTmpDir () {
        this.path = tmp.tmpNameSync({ dir: TESTCAFE_TMP_DIRS_ROOT, prefix: this.namePrefix + '-' });

        await ensureDir(this.path);

        this.lockFile = new LockFile(this.path);

        this.lockFile.init();
    }

    static async createDirectory (prefix) {
        const tmpDir = new TempDirectory(prefix);

        await tmpDir.init();

        return tmpDir;
    }

    static disposeDirectoriesSync () {
        Object.values(USED_TEMP_DIRS).forEach(tmpDir => tmpDir.disposeSync());
    }

    async init () {
        await ensureDir(TESTCAFE_TMP_DIRS_ROOT);

        const tmpDirNames = await this._getTmpDirsList(this.namePrefix);

        DEBUG_LOGGER('Found temp directories:', tmpDirNames);

        const existingTmpDirFound = await this._findFreeTmpDir(tmpDirNames);

        if (!existingTmpDirFound)
            await this._createNewTmpDir();

        DEBUG_LOGGER('Temp directory path: ', this.path);

        await cleanupProcess.init();

        await cleanupProcess.addDirectory(this.path);

        USED_TEMP_DIRS[this.path] = this;
    }

    disposeSync () {
        if (!USED_TEMP_DIRS[this.path])
            return;

        this.lockFile.dispose();

        delete USED_TEMP_DIRS[this.path];
    }

    async dispose () {
        if (!USED_TEMP_DIRS[this.path])
            return;

        this.lockFile.dispose();

        await cleanupProcess.removeDirectory(this.path);

        delete USED_TEMP_DIRS[this.path];
    }

    // NOTE: for testing purposes
    static get TEMP_DIRECTORIES_ROOT () {
        return TESTCAFE_TMP_DIRS_ROOT;
    }

    static set TEMP_DIRECTORIES_ROOT (value) {
        TESTCAFE_TMP_DIRS_ROOT = value;

        return value;
    }
}

setupExitHook(TempDirectory.disposeDirectoriesSync);
