import { ReporterPluginFactory } from '../reporter/interfaces';
import { AttachReporterError } from '../errors/runtime';

export function requireReporterPluginFactory (reporterName: string): ReporterPluginFactory {
    const reporterFullName = `testcafe-reporter-${reporterName}`;

    try {
        return require(reporterFullName);
    }
    catch (err: any) {
        throw new AttachReporterError(err, reporterFullName);
    }
}

export function getPluginFactory (reporterFactorySource: string | ReporterPluginFactory): ReporterPluginFactory {
    if (!isReporterPluginFactory(reporterFactorySource))
        return requireReporterPluginFactory(reporterFactorySource);

    return reporterFactorySource;
}

export function isReporterPluginFactory (value: string | Function): value is ReporterPluginFactory {
    return typeof value === 'function';
}

export function processReporterName (value: string | ReporterPluginFactory): string {
    if (isReporterPluginFactory(value))
        return value.name || 'function () {}';

    return value;
}
