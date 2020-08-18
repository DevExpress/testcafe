import { ReporterPluginFactory } from '../reporter/interfaces';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

export function requireReporterPluginFactory (reporterName: string): ReporterPluginFactory {
    try {
        return require('testcafe-reporter-' + reporterName);
    }
    catch (err) {
        throw new GeneralError(RUNTIME_ERRORS.cannotFindReporterForAlias, reporterName);
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
