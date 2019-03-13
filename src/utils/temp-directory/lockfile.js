import path from 'path';
import debug from 'debug';
import fs from 'fs';


const LOCKFILE_EXTENSION = '.lockfile';
const STALE_LOCKFILE_AGE = 2 * 24 * 60 * 60 * 1000;
const DEBUG_LOGGER       = debug('testcafe:utils:temp-directory:lockfile');

export default class LockFile {
    constructor (dirPath) {
        this.name      = path.basename(dirPath) + LOCKFILE_EXTENSION;
        this.directory = path.dirname(dirPath);
        this.path      = path.join(this.directory, this.name);
    }

    _open ({ force = false } = {}) {
        try {
            fs.writeFileSync(this.path, '', { flag: force ? 'w' : 'wx' });

            return true;
        }
        catch (e) {
            DEBUG_LOGGER('Failed to init lockfile ' + this.path);
            DEBUG_LOGGER(e);

            return false;
        }
    }

    _isStale () {
        const currentMs = Date.now();

        try {
            const { mtimeMs } = fs.statSync(this.path);

            return currentMs - mtimeMs > STALE_LOCKFILE_AGE;
        }
        catch (e) {
            DEBUG_LOGGER('Failed to check status of lockfile ' + this.path);
            DEBUG_LOGGER(e);

            return false;
        }
    }

    static get LOCKFILE_EXTENSION () {
        return LOCKFILE_EXTENSION;
    }

    init () {
        if (this._open())
            return true;

        if (this._isStale())
            return this._open({ force: true });

        return false;
    }

    dispose () {
        try {
            fs.unlinkSync(this.path);
        }
        catch (e) {
            DEBUG_LOGGER('Failed to dispose lockfile ' + this.path);
            DEBUG_LOGGER(e);
        }
    }
}
