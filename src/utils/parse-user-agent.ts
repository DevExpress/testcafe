import Bowser from 'bowser';

const DEFAULT_NAME            = 'Other';
const DEFAULT_VERSION         = '0.0';
const DEFAULT_PLATFORM_TYPE   = DEFAULT_NAME.toLowerCase();
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
        parsedUserAgent.platform.type   = DEFAULT_PLATFORM_TYPE;
        parsedUserAgent.engine.name     = DEFAULT_NAME;
        parsedUserAgent.engine.version  = DEFAULT_VERSION;
    }
    else
        parsedUserAgent = Bowser.parse(userAgent);

    const browserName    = parsedUserAgent.browser.name || DEFAULT_NAME;
    const browserVersion = parsedUserAgent.browser.version || DEFAULT_VERSION;

    const os: ParsedComponent = { name: DEFAULT_NAME, version: DEFAULT_VERSION };

    if (parsedUserAgent.os.name) {
        os.name = parsedUserAgent.os.name;

        // NOTE: a 'versionName' property value is more readable in the case of Windows (GH-481):
        // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1".
        if (parsedUserAgent.os.name.toLowerCase() === 'windows') {
            if (parsedUserAgent.os.versionName)
                os.version = parsedUserAgent.os.versionName;
        }
        else if (parsedUserAgent.os.version)
            os.version = parsedUserAgent.os.version;
    }

    const engine: ParsedComponent = {
        name:    parsedUserAgent.engine.name || DEFAULT_NAME,
        version: parsedUserAgent.engine.version || DEFAULT_VERSION
    };

    const prettyUserAgent = `${browserName} ${browserVersion} / ${os.name} ${os.version}`;

    return {
        name:            browserName,
        version:         browserVersion,
        platform:        parsedUserAgent.platform.type || DEFAULT_PLATFORM_TYPE,
        os,
        engine,
        prettyUserAgent: prettyUserAgent,
        userAgent
    };
}
