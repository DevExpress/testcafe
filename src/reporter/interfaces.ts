import { Writable as WritableStream } from 'stream';

export interface ReporterPlugin {
    init(): void;
    reportTaskStart(): void;
    reportFixtureStart(): void;
    reportTestStart?(): void;
    reportTestActionStart?(): void;
    reportTestActionDone?(): void;
    reportTestDone(): void;
    reportTaskDone(): void;
    reportWarnings?(): void;
}

export interface ReporterSource {
    name: string;
    output?: string | WritableStream;
    options?: Record<string, any>;
}

export interface ReporterPluginSource {
    plugin: ReporterPlugin;
    name: string;
    outStream?: WritableStream;
}

export interface ReporterPluginFactory {
    (options?: Record<string, any>): ReporterPlugin;
}

export interface ReporterSymbols {
    ok: string;
    err: string;
}

