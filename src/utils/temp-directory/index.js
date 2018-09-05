import debug from 'debug';
import os from 'os';
import path from 'path';
import setupExitHook from 'async-exit-hook';
import tmp from 'tmp';
import makeDir from 'make-dir';
import LockFile from './lockfile';
import cleanupProcess from './cleanup-process';
import { readDir } from '../../utils/promisified-functions';


// NOTE: mutable for testing purposes
const TESTCAFE_TMP_DIRS_ROOT = path.join(os.tmpdir(), 'testcafe');
const DEFAULT_NAME_PREFIX    = 'tmp';
const USED_TEMP_DIRS         = {};
const DEBUG_LOGGER           = debug('testcafe:utils:temp-directory');

export default class TempDirectory {
    constructor (namePrefix) {
        this.namePrefix = namePrefix || DEFAULT_NAME_PREFIX;

        this.path     = '';
        this.lockFile = null;
    }

    async _getTmpDirsList () {
        const tmpDirNames = await readDir(TempDirectory.TEMP_DIRECTORIES_ROOT);

        return tmpDirNames
            .filter(tmpDir => !USED_TEMP_DIRS[tmpDir])
            .filter(tmpDir => path.basename(tmpDir).startsWith(this.namePrefix));
    }

    async _findFreeTmpDir (tmpDirNames) {
        for (const tmpDirName of tmpDirNames) {
            const tmpDirPath = path.join(TempDirectory.TEMP_DIRECTORIES_ROOT, tmpDirName);

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
        this.path = tmp.tmpNameSync({ dir: TempDirectory.TEMP_DIRECTORIES_ROOT, prefix: this.namePrefix + '-' });

        await makeDir(this.path);

        this.lockFile = new LockFile(this.path);

        this.lockFile.init();
    }

    _disposeSync () {
        if (!USED_TEMP_DIRS[this.path])
            return;

        this.lockFile.dispose();

        delete USED_TEMP_DIRS[this.path];
    }

    static async createDirectory (prefix) {
        const tmpDir = new TempDirectory(prefix);

        await tmpDir.init();

        return tmpDir;
    }

    static disposeDirectoriesSync () {
        Object.values(USED_TEMP_DIRS).forEach(tmpDir => tmpDir._disposeSync());
    }

    async init () {
        await makeDir(TempDirectory.TEMP_DIRECTORIES_ROOT);

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

    async dispose () {
        if (!USED_TEMP_DIRS[this.path])
            return;

        this.lockFile.dispose();

        await cleanupProcess.removeDirectory(this.path);

        delete USED_TEMP_DIRS[this.path];
    }
}

// NOTE: exposed for testing purposes
TempDirectory.TEMP_DIRECTORIES_ROOT = TESTCAFE_TMP_DIRS_ROOT;

setupExitHook(TempDirectory.disposeDirectoriesSync);
