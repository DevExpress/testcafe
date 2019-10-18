import Bowser from 'bowser';

const DEFAULT_BROWSER_NAME    = 'Other';
const DEFAULT_BROWSER_VERSION = '0.0';
// NOTE: we need to pass the ' ' user agent to get a "default" parsed object (GH-481)
const EMPTY_BOWSER_USER_AGENT = ' ';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function parseUserAgent (userAgent: string, browserAlias?: string): any {
    let parsedUserAgent;

    if (!userAgent) {
        parsedUserAgent = Bowser.parse(EMPTY_BOWSER_USER_AGENT);

        parsedUserAgent.browser.name    = DEFAULT_BROWSER_NAME;
        parsedUserAgent.browser.version = DEFAULT_BROWSER_VERSION;
    }
    else
        parsedUserAgent = Bowser.parse(userAgent);

    const headless = !!browserAlias && browserAlias.indexOf(':headless') !== -1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const os: any = {};

    if (parsedUserAgent.os.name) {
        os.name = parsedUserAgent.os.name;

        // NOTE: we use the more readable 'versionName' property in the case of Windows.
        // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1" (GH-481).
        if (parsedUserAgent.os.name.toLowerCase() === 'windows' && parsedUserAgent.os.versionName)
            os.version = parsedUserAgent.os.versionName;
        else if (parsedUserAgent.os.version)
            os.version = parsedUserAgent.os.version;
    }

    const compactUserAgent = parsedUserAgent.browser.name + ' ' + parsedUserAgent.browser.version +
        (parsedUserAgent.os.name ? ' / ' + parsedUserAgent.os.name + (os.version ? ' ' + os.version : '') : '');

    return {
        alias:         browserAlias,
        headless,
        name:          parsedUserAgent.browser.name,
        version:       parsedUserAgent.browser.version,
        platform:      parsedUserAgent.platform.type,
        os,
        engine:        parsedUserAgent.engine,
        userAgent:     compactUserAgent,
        fullUserAgent: userAgent
    };
}
