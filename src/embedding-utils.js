import ReporterPluginHost from './reporter/plugin-host';
import TestRunErrorFormattableAdapter from './errors/test-run/formattable-adapter';
import testRunErrors from './errors/test-run';

export default {
    TestRunErrorFormattableAdapter,
    testRunErrors,

    buildReporterPlugin (pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};
