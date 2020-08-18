import { Writable as WritableStream } from 'stream';

export interface ReporterPlugin {
    reportTaskStart(): void;
    reportFixtureStart(): void;
    reportTestStart?(): void;
    reportTestActionStart?(): void;
    reportTestActionDone?(): void;
    reportTestDone(): void;
    reportTaskDone(): void;
}

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
