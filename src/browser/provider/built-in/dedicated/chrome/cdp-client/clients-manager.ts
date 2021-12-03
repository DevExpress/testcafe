import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import ProtocolApi = ProtocolProxyApi.ProtocolApi;


// NOTE: temporary solution
let currentClient: ProtocolApi;

export function setClient (client: ProtocolApi): void {
    currentClient = client;
}

export function getClient (): ProtocolApi {
    return currentClient;
}
