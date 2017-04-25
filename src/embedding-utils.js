import ReporterPluginHost from './reporter/plugin-host';
import TestRunErrorFormattableAdapter from './errors/test-run/formattable-adapter';
import * as testRunErrors from './errors/test-run';
import TestRun from './test-run';
import COMMAND_TYPE from './test-run/commands/type';
import Assignable from './utils/assignable';

export default {
    TestRunErrorFormattableAdapter,
    TestRun,
    testRunErrors,
    COMMAND_TYPE,
    Assignable,

    buildReporterPlugin (pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};
