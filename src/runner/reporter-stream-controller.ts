import { EventEmitter } from 'events';
import { Writable } from 'stream';

interface Plugin {
    name: string;
}
interface PluginInfo {
    stream: Writable;
    plugin: Plugin;
}

class ReporterStreamController extends EventEmitter {
    private _pluginInfos: PluginInfo[];

    public constructor () {
        super();

        this._pluginInfos = [];
    }

    public ensureUniqueStream (stream: Writable, plugin: Plugin): boolean {
        const pluginInfo = this._pluginInfos.find(info => info.stream === stream);

        if (!pluginInfo)
            this._pluginInfos.push({ stream: stream, plugin: plugin });
        else if (pluginInfo.plugin !== plugin) {
            this.emit('multiple-reporters-error', [plugin.name, pluginInfo.plugin.name].join(', '));

            return false;
        }

        return true;
    }
}

export default new ReporterStreamController();
