import Bowser from 'bowser';

const DEFAULT_BROWSER_NAME    = 'Other';
const DEFAULT_BROWSER_VERSION = '0.0';
const EMPTY_PARSED_USER_AGENT = Bowser.parse(' ');

interface ParsedOS {
    name?: string;
    version?: string;
}

interface ParsedEngine {
    name?: string;
    version?: string;
}

interface ParsedUserAgent {
    name: string;
    version: string;
    platform: string;
    os: ParsedOS;
    engine: ParsedEngine;
    userAgent: string;
    fullUserAgent: string;
}

export default function parseUserAgent (userAgent: string = ''): ParsedUserAgent {
    let parsedUserAgent;

    if (!userAgent) {
        parsedUserAgent = EMPTY_PARSED_USER_AGENT;

        parsedUserAgent.browser.name    = DEFAULT_BROWSER_NAME;
        parsedUserAgent.browser.version = DEFAULT_BROWSER_VERSION;
    }
    else
        parsedUserAgent = Bowser.parse(userAgent);

    const os: ParsedOS = {};

    if (parsedUserAgent.os.name) {
        os.name = parsedUserAgent.os.name;

        // NOTE: a 'versionName' property value is more readable in the case of Windows (GH-481):
        // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1".
        if (parsedUserAgent.os.name.toLowerCase() === 'windows' && parsedUserAgent.os.versionName)
            os.version = parsedUserAgent.os.versionName;
        else if (parsedUserAgent.os.version)
            os.version = parsedUserAgent.os.version;
    }

    const compactUserAgent = parsedUserAgent.browser.name + ' ' + parsedUserAgent.browser.version +
        (parsedUserAgent.os.name ? ' / ' + parsedUserAgent.os.name + (os.version ? ' ' + os.version : '') : '');

    return {
        name:          parsedUserAgent.browser.name || '',
        version:       parsedUserAgent.browser.version || '',
        platform:      parsedUserAgent.platform.type || '',
        os,
        engine:        parsedUserAgent.engine,
        userAgent:     compactUserAgent,
        fullUserAgent: userAgent
    };
}
