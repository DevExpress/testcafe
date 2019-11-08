import Bowser from 'bowser';

const DEFAULT_NAME    = 'Other';
const DEFAULT_VERSION = '0.0';
const EMPTY_PARSED_USER_AGENT = Bowser.parse(' ');

interface ParsedComponent {
    name: string;
    version: string;
}

interface ParsedUserAgent {
    name: string;
    version: string;
    platform: string;
    os: ParsedComponent;
    engine: ParsedComponent;
    prettyUserAgent: string;
    userAgent: string;
}

export default function parseUserAgent (userAgent: string = ''): ParsedUserAgent {
    let parsedUserAgent;

    if (!userAgent) {
        parsedUserAgent = EMPTY_PARSED_USER_AGENT;

        parsedUserAgent.browser.name    = DEFAULT_NAME;
        parsedUserAgent.browser.version = DEFAULT_VERSION;
        parsedUserAgent.os.name         = DEFAULT_NAME;
        parsedUserAgent.os.version      = DEFAULT_VERSION;
        parsedUserAgent.platform.type   = DEFAULT_NAME;
        parsedUserAgent.engine.name     = DEFAULT_NAME;
        parsedUserAgent.engine.version  = DEFAULT_VERSION;
    }
    else
        parsedUserAgent = Bowser.parse(userAgent);

    let browserName: string;
    let browserVersion: string;

    if (parsedUserAgent.browser.name) {
        browserName    = parsedUserAgent.browser.name;
        browserVersion = parsedUserAgent.browser.version || '';
    }
    else {
        browserName = DEFAULT_NAME;
        browserVersion = DEFAULT_VERSION;
    }

    const os: ParsedComponent = { name: DEFAULT_NAME, version: DEFAULT_VERSION };

    if (parsedUserAgent.os.name) {
        os.name = parsedUserAgent.os.name;

        // NOTE: a 'versionName' property value is more readable in the case of Windows (GH-481):
        // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1".
        if (parsedUserAgent.os.name.toLowerCase() === 'windows')
            os.version = parsedUserAgent.os.versionName || '';
        else
            os.version = parsedUserAgent.os.version || '';
    }

    const engine: ParsedComponent = { name: DEFAULT_NAME, version: DEFAULT_VERSION };

    if (parsedUserAgent.engine.name) {
        engine.name    = parsedUserAgent.engine.name;
        engine.version = parsedUserAgent.engine.version || '';
    }

    const prettyUserAgent = browserName + (browserVersion ? ' ' + browserVersion : '') +
        (os.name ? ' / ' + os.name + (os.version ? ' ' + os.version : '') : '');

    return {
        name:            browserName,
        version:         browserVersion,
        platform:        parsedUserAgent.platform.type || DEFAULT_NAME,
        os,
        engine,
        prettyUserAgent: prettyUserAgent,
        userAgent
    };
}
