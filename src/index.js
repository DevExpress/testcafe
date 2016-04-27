import TestCafe from './testcafe';
import ReporterPluginHost from './reporter/plugin-host';
import TestRunErrorFormattableAdapter from './errors/test-run/formattable-adapter';
import * as endpointUtils from 'endpoint-utils';
import { GeneralError } from './errors/runtime';
import MESSAGE from './errors/runtime/message';
import { Role, Hybrid } from './api/common';

// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        var valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(MESSAGE.invalidHostname, hostname);
    }
    else
        hostname = await endpointUtils.getMyHostname();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        var isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(MESSAGE.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}

// API
async function createTestCafe (hostname, port1, port2) {
    [hostname, port1, port2] = await Promise.all([
        getValidHostname(hostname),
        getValidPort(port1),
        getValidPort(port2)
    ]);

    return new TestCafe(hostname, port1, port2);
}

// Plugin testing utils
createTestCafe.pluginTestingUtils = {
    buildReporterPlugin (pluginFactory, outStream) {
        var plugin = pluginFactory();

        return new ReporterPluginHost(plugin, outStream);
    }
};

// Embedding utils
createTestCafe.embeddingUtils = {
    TestRunErrorFormattableAdapter: TestRunErrorFormattableAdapter
};

// Common runtime
createTestCafe.Role   = Role;
createTestCafe.Hybrid = Hybrid;

export default createTestCafe;
