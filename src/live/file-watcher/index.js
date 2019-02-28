import EventEmitter from 'events';
import fs from 'fs';
import ModulesGraph from './modules-graph';

const WATCH_LOCKED_TIMEOUT = 700;

export default class FileWatcher extends EventEmitter {
    constructor (files) {
        super();

        this.FILE_CHANGED_EVENT = 'file-changed';

        this.watchers         = {};
        this.lockedFiles      = {};
        this.modulesGraph     = null;
        this.lastChangedFiles = [];

        files.forEach(f => this.addFile(f));
    }

    _onChanged (file) {
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

        this.emit(this.FILE_CHANGED_EVENT, { file });
    }

    _watch (file) {
        if (this.lockedFiles[file])
            return;

        this.lockedFiles[file] = setTimeout(() => {
            this._onChanged(file);

            delete this.lockedFiles[file];
        }, WATCH_LOCKED_TIMEOUT);
    }

    stop () {
        Object.values(this.watchers).forEach(watcher => {
            watcher.close();
        });
    }

    addFile (file) {
        if (!this.watchers[file] && file.indexOf('node_modules') < 0) {
            if (this.modulesGraph) {
                this.lastChangedFiles.push(file);
                this.modulesGraph.addNode(file, require.cache);
            }

            this.watchers[file] = fs.watch(file, () => this._watch(file));
        }
    }
}
