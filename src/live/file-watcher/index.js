import EventEmitter from 'events';
import fs from 'fs';
import ModulesGraph from './modules-graph';
import NODE_MODULES from '../../shared/node-modules-folder-name';
import toPosixPath from '../../utils/to-posix-path';

const WATCH_LOCKED_TIMEOUT = 700;

let instance = null;

const BABEL_PRESET_STAGE_2_MODULE_PATH = 'lib/compiler/babel/preset-stage-2.js';

export default class FileWatcher extends EventEmitter {
    constructor () {
        super();

        if (!instance) {
            this.watchers         = {};
            this.lockedFiles      = {};
            this.modulesGraph     = null;
            this.lastChangedFiles = [];

            instance = this;
        }

        return instance;
    }

    _onChanged (controller, file) {
        const cache = require.cache;

        if (!this.modulesGraph) {
            this.modulesGraph = new ModulesGraph();
            this.modulesGraph.build(cache, Object.keys(this.watchers));
        }
        else {
            this.lastChangedFiles.forEach(changedFile => this.modulesGraph.rebuildNode(cache, changedFile));
            this.lastChangedFiles = [];
        }

        this.lastChangedFiles.push(file);
        this.modulesGraph.clearParentsCache(cache, file);

        controller.runTests(true);
    }

    _watch (controller, file) {
        if (this.lockedFiles[file])
            return;

        this.lockedFiles[file] = setTimeout(() => {
            this._onChanged(controller, file);

            delete this.lockedFiles[file];
        }, WATCH_LOCKED_TIMEOUT);
    }

    stop () {
        Object.values(this.watchers).forEach(watcher => {
            watcher.close();
        });
    }

    addFile (controller, file) {
        if (this.watchers[file] || !FileWatcher.shouldWatchFile(file))
            return;

        if (this.modulesGraph) {
            this.lastChangedFiles.push(file);
            this.modulesGraph.addNode(file, require.cache);
        }

        this.watchers[file] = fs.watch(file, () => this._watch(controller, file));
    }

    static shouldWatchFile (file) {
        return !file.includes(NODE_MODULES) &&
            !toPosixPath(file).includes(BABEL_PRESET_STAGE_2_MODULE_PATH);
    }
}
