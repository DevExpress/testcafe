import Bowser from 'bowser';
import { OSInfo } from 'get-os-info';

const DEFAULT_NAME            = 'Other';
const DEFAULT_VERSION         = '0.0';
const DEFAULT_PLATFORM_TYPE   = DEFAULT_NAME.toLowerCase();
const EMPTY_PARSED_USER_AGENT = Bowser.parse(' ');

const HEADLESS_EDGE = {
    regExp:      /HeadlessEdg/i,
    browserName: 'Microsoft Edge',
};

interface ParsedComponent {
    name: string;
    version: string;
}

export interface ParsedUserAgent {
    name: string;
    version: string;
    platform: string;
    os: ParsedComponent;
    engine: ParsedComponent;
    prettyUserAgent: string;
    userAgent: string;
}

function calculateBrowser (browserDetails: Bowser.Parser.BrowserDetails): ParsedComponent {
    return {
        name:    browserDetails.name || DEFAULT_NAME,
        version: browserDetails.version || DEFAULT_VERSION,
    };
}

function calculateOs (parsedOsDetails: Bowser.Parser.OSDetails): ParsedComponent {
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

function calculateEngine (engineDetails: Bowser.Parser.EngineDetails): ParsedComponent {
    return {
        name:    engineDetails.name || DEFAULT_NAME,
        version: engineDetails.version || DEFAULT_VERSION,
    };
}

function calculateParsedUserAgent (userAgent: string): Bowser.Parser.ParsedResult {
    if (!userAgent)
        return EMPTY_PARSED_USER_AGENT;

    // The 'bowser' module incorrectly determine the headless edge browser.
    // Since this module is abandoned, we are forced to fix it in our side.
    const isHeadlessEdge  = HEADLESS_EDGE.regExp.test(userAgent);
    const parsedUserAgent = Bowser.parse(userAgent);

    if (isHeadlessEdge)
        parsedUserAgent.browser.name = HEADLESS_EDGE.browserName;

    return parsedUserAgent;
}

export function calculatePrettyUserAgent (browser: ParsedComponent, os: ParsedComponent): string {
    return `${browser.name} ${browser.version} / ${os.name} ${os.version}`;
}

export function parseUserAgent (userAgent = '', osInfo?: OSInfo): ParsedUserAgent {
    const parsedUserAgent = calculateParsedUserAgent(userAgent);
    const browser         = calculateBrowser(parsedUserAgent.browser);
    const os              = osInfo || calculateOs(parsedUserAgent.os);
    const engine          = calculateEngine(parsedUserAgent.engine);
    const prettyUserAgent = calculatePrettyUserAgent(browser, os);

    return {
        name:            browser.name,
        version:         browser.version,
        platform:        parsedUserAgent.platform.type || DEFAULT_PLATFORM_TYPE,
        os,
        engine,
        prettyUserAgent: prettyUserAgent,
        userAgent,
    };
}
