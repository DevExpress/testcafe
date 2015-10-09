import { readSync as read } from 'read-file-relative';
import { Proxy } from 'testcafe-hammerhead';
import * as endpointUtils from 'endpoint-utils';
import BrowserConnectionGateway from './browser-connection/gateway';
import BrowserConnection from './browser-connection';
import Runner from './runner';
import { MESSAGE, getText } from './messages';


// Const
const CORE_SCRIPT   = read('./client/core/index.js');
const RUNNER_SCRIPT = read('./client/runner/index.js');
const UI_SCRIPT     = read('./client/ui/index.js');
const UI_STYLE      = read('./client/ui/styles.css');
const UI_SPRITE     = read('./client/ui/sprite.png', true);


// TestCafe
class TestCafe {
    constructor (hostname, port1, port2) {
        this.proxy                    = new Proxy(hostname, port1, port2);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy);

        this._registerAssets();
    }

    _registerAssets () {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-runner.js', { content: RUNNER_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: UI_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-styles.css', { content: UI_STYLE, contentType: 'text/css' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: UI_SPRITE, contentType: 'image/png' });
    }


    // API
    createBrowserConnection () {
        return new BrowserConnection(this.browserConnectionGateway);
    }

    createRunner () {
        return new Runner(this.proxy, this.browserConnectionGateway);
    }

    close () {
        this.proxy.close();
    }
}

// Factory function and validations
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

export default async function (hostname, port1, port2) {
    [hostname, port1, port2] = await Promise.all([
        getValidHostname(hostname),
        getValidPort(port1),
        getValidPort(port2)
    ]);

    return new TestCafe(hostname, port1, port2);
};
