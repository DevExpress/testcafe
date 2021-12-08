import * as clientsManager from '../clients-manager';
import { ServerNode } from '../types';

export async function describeNode (objectId: string): Promise<ServerNode> {
    const object   = { objectId };
    const { DOM }  = clientsManager.getClient();
    const { node } = await DOM.describeNode(object);

    return Object.assign(node, object);
}
