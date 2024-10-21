import remoteChrome, { TargetInfo } from 'chrome-remote-interface';

const DEVTOOLS_TAB_URL_REGEX = /^devtools:\/\/devtools/;
// NOTE: Github issue: https://github.com/DevExpress/testcafe/issues/8286
const CHROME_EXTENSION_TAB_URL_REGEX = /^chrome-extension:\/\//;

function isInternalUrl (url: string): boolean {
    return DEVTOOLS_TAB_URL_REGEX.test(url) || CHROME_EXTENSION_TAB_URL_REGEX.test(url);
}

export async function getTabs (port: number): Promise<TargetInfo[]> {
    const tabs = await remoteChrome.List({ port });

    return tabs.filter(t => t.type === 'page' && !isInternalUrl(t.url));
}

export async function getTabById (port: number, id: string): Promise<TargetInfo> {
    const tabs = await getTabs(port);

    return tabs.find(tab => tab.id === id) as TargetInfo;
}

export async function getFirstTab (port: number): Promise<TargetInfo> {
    const tabs = await getTabs(port);

    return tabs[0];
}

export async function getActiveTab (port: number, activeWindowId: string): Promise<TargetInfo> {
    const tabs = await getTabs(port);

    if (activeWindowId)
        return tabs.find(t => t.title.includes(activeWindowId)) as TargetInfo;

    return tabs[0];
}
