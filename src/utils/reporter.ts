import { ReporterPluginFactory } from '../reporter/interfaces';
import { LoadReporterError } from '../errors/runtime';
import REPORTER_MODULE_PREFIX from '../reporter/prefix';

export function requireReporterPluginFactory (reporterName: string): ReporterPluginFactory {
    const reporterFullName = `${REPORTER_MODULE_PREFIX}${reporterName}`;

    try {
        return require(reporterFullName);
    }
    catch (err: any) {
        throw new LoadReporterError(err, reporterFullName);
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
