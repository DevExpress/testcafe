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

function calculateSimpleComponent (bowserDetails: Bowser.Parser.Details): ParsedComponent {
    return {
        name:    bowserDetails.name || DEFAULT_NAME,
        version: bowserDetails.version || DEFAULT_VERSION
    };
}

function calculateOsComponent (parsedOsDetails: Bowser.Parser.OSDetails): ParsedComponent {
    const name = parsedOsDetails.name || DEFAULT_NAME;

    let version = DEFAULT_VERSION;

    // NOTE: a 'versionName' property value is more readable in the case of Windows (GH-481):
    // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1".
    if (name.toLowerCase() === 'windows') {
        if (parsedOsDetails.versionName)
            version = parsedOsDetails.versionName;
    }
    else if (parsedOsDetails.version)
        version = parsedOsDetails.version;

    return { name, version };
}

function composePrettyUserAgent (browser: ParsedComponent, os: ParsedComponent): string {
    return `${browser.name} ${browser.version} / ${os.name} ${os.version}`;
}

export default function parseUserAgent (userAgent: string = ''): ParsedUserAgent {
    const parsedUserAgent = userAgent ? Bowser.parse(userAgent) : EMPTY_PARSED_USER_AGENT;
    const browser         = calculateSimpleComponent(parsedUserAgent.browser);
    const os              = calculateOsComponent(parsedUserAgent.os);
    const engine          = calculateSimpleComponent(parsedUserAgent.engine);
    const prettyUserAgent = composePrettyUserAgent(browser, os);

    return {
        name:            browser.name,
        version:         browser.version,
        platform:        parsedUserAgent.platform.type || DEFAULT_PLATFORM_TYPE,
        os,
        engine,
        prettyUserAgent: prettyUserAgent,
        userAgent
    };
}
