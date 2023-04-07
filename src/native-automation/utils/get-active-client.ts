import remoteChrome from 'chrome-remote-interface';
import BrowserConnection from '../../browser/connection';

export async function getActiveClient (connection: BrowserConnection): Promise<remoteChrome.ProtocolApi> {
    return connection.provider.plugin.openedBrowsers[connection.id].browserClient.getActiveClient();
}
