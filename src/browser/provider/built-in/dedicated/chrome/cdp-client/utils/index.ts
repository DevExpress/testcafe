import { ProtocolApi } from 'chrome-remote-interface';
import { ClientObject } from '../interfaces';

export async function getObjectId ({ Runtime }: ProtocolApi, element: ClientObject ): Promise<string> {
    const node = typeof element === 'string' ? await Runtime.evaluate({ expression: `document.querySelector('${element}')` }) : element;

    return node.result?.objectId || '';
}
