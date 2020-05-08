import { EventEmitter } from 'events';
import { Writable } from 'stream';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import Reporter from '../reporter';

interface Plugin {
    name: string;
    streamController: ReporterStreamController;
}

interface PluginInfo {
    stream: Writable;
    plugin: Plugin;
}

class ReporterStreamController {
    public multipleStreamError: GeneralError | null;
    private _pluginInfos: PluginInfo[];
    private _task: EventEmitter;

    public constructor (task: EventEmitter, reporters: Reporter[]) {
        this._pluginInfos = [];
        this._task = task;
        this.multipleStreamError = null;

        reporters.forEach(({ plugin }) => {
            plugin.streamController = this;
        });
    }

    public ensureUniqueStream (stream: Writable, plugin: Plugin): boolean {
        const pluginInfo = this._pluginInfos.find(info => info.stream === stream);

        if (!pluginInfo)
            this._pluginInfos.push({ stream: stream, plugin: plugin });
        else if (pluginInfo.plugin !== plugin) {
            const message = [pluginInfo.plugin.name, plugin.name].join(', ');

            this.multipleStreamError = new GeneralError(RUNTIME_ERRORS.multipleSameStreamReporters, message);

            this._task.emit('done');

            return false;
        }

        return true;
    }
}

export default ReporterStreamController;
