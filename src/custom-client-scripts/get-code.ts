import { processScript } from 'testcafe-hammerhead';
import INTERNAL_PROPERTIES from '../client/driver/internal-properties';
import ClientScript from './client-script';

export default function getCustomClientScriptCode (script: ClientScript, proxyless: boolean): string {
    const scriptCode = proxyless ? script.content : processScript(script.content);

    return `try {
        ${scriptCode}
    }
    catch (e) {
       window['${INTERNAL_PROPERTIES.testCafeDriverInstance}'].onCustomClientScriptError(e, '${script.module || ''}');
    }`;
}
