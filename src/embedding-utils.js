import ReporterPluginHost from './reporter/plugin-host';
import TestRunErrorFormattableAdapter from './errors/test-run/formattable-adapter';
import * as testRunErrors from './errors/test-run';
import TestRun from './test-run';
import COMMAND_TYPE from './test-run/commands/type';
import Assignable from './utils/assignable';
import { getTestList, getTestListFromCode } from './compiler/test-file/formats/es-next/get-test-list';
import { getTypeScriptTestList, getTypeScriptTestListFromCode } from './compiler/test-file/formats/typescript/get-test-list';
import { initSelector } from './test-run/commands/validations/initializers';

export default {
    getTestList,
    getTypeScriptTestList,
    getTestListFromCode,
    getTypeScriptTestListFromCode,
    TestRunErrorFormattableAdapter,
    TestRun,
    testRunErrors,
    COMMAND_TYPE,
    Assignable,
    initSelector,

    buildReporterPlugin (pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};
