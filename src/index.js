import TestCafe from './testcafe';
import ReporterPluginHost from './reporter/plugin-host';
import * as endpointUtils from 'endpoint-utils';
import { MESSAGE, getText } from './messages';

// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        var valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new Error(getText(MESSAGE.invalidHostname, hostname));
    }
    else
        hostname = await endpointUtils.getMyHostname();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        var isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new Error(getText(MESSAGE.portIsNotFree, port));
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

export default createTestCafe;
