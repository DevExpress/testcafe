import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import { ServerNode } from '../types';

export async function describeNode (DOM: ProtocolProxyApi.DOMApi, objectId: string): Promise<ServerNode> {
    const object   = { objectId };
    const { node } = await DOM.describeNode(object);

    return Object.assign(node, object);
}
