import { Writable as WritableStream } from 'stream';

type ReporterPlugin = unknown;

export interface ReporterSource {
    name: string;
    output?: string | WritableStream;
}

export interface ReporterPluginSource {
    plugin: ReporterPlugin;
    outStream?: WritableStream;
}

export interface ReporterPluginFactory {
    (): ReporterPlugin;
}
