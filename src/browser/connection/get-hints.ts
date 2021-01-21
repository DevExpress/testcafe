import { flattenDeep, uniq } from 'lodash';
import humanizeDuration from 'humanize-duration';
import { BrowserSetOptions } from '../../runner/interfaces';
import BrowserConnection from './';
import BrowserConnectionErrorHint from './error-hints';
import { LOCAL_BROWSER_INIT_TIMEOUT, REMOTE_BROWSER_INIT_TIMEOUT } from '../../utils/browser-connection-timeouts';
import renderTemplate from '../../utils/render-template';
import TEMPLATES from '../../errors/runtime/templates';

// NOTE: hint about too high concurrency factor will be added to the error after exceeding this value
const CONCURRENCY_FACTOR_UPPERBOUND = 3;

function getUsedTimeoutMsg (browserInitTimeout?: number): string {
    if (browserInitTimeout) {
        const browserInitTimeoutStr = humanizeDuration(browserInitTimeout);

        return `${browserInitTimeoutStr} for all browsers`;
    }

    const localInitTimeoutStr  = humanizeDuration(LOCAL_BROWSER_INIT_TIMEOUT);
    const remoteInitTimeoutStr = humanizeDuration(REMOTE_BROWSER_INIT_TIMEOUT);

    return `${localInitTimeoutStr} for local browsers and ${remoteInitTimeoutStr} for remote browsers`;
}

export default function getHints (connections: BrowserConnection[], opts: BrowserSetOptions): string[] {
    const warningsFromConnections  = uniq(flattenDeep(connections.map(bc => bc.warningLog.messages)));
    const warningsFromBootstrapper = opts.warningLog.messages;

    const hints = [ ...warningsFromConnections, ...warningsFromBootstrapper ];

    if (opts.concurrency > CONCURRENCY_FACTOR_UPPERBOUND)
        hints.push(renderTemplate(TEMPLATES[BrowserConnectionErrorHint.TooHighConcurrencyFactor], opts.concurrency));

    hints.push(renderTemplate(
        TEMPLATES[BrowserConnectionErrorHint.UseBrowserInitOption],
        getUsedTimeoutMsg(opts.browserInitTimeout)
    ));

    hints.push(renderTemplate(TEMPLATES[BrowserConnectionErrorHint.RestErrorCauses]));

    return hints;
}
