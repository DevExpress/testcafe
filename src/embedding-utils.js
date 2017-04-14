import ReporterPluginHost from './reporter/plugin-host';
import TestRunErrorFormattableAdapter from './errors/test-run/formattable-adapter';
import * as testRunErrors from './errors/test-run';
import TestRun from './test-run';

export default {
    TestRunErrorFormattableAdapter,
    TestRun,
    testRunErrors,

    buildReporterPlugin (pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};
