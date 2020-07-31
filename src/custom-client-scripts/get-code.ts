import { processScript } from 'testcafe-hammerhead';
import INTERNAL_PROPERTIES from '../client/driver/internal-properties';
import ClientScript from './client-script';

export default function getCustomClientScriptCode (script: ClientScript): string {
    return `try {
        ${processScript(script.content)}
    }
    catch (e) {
       window['${INTERNAL_PROPERTIES.testCafeDriverInstance}'].onCustomClientScriptError(e, '${script.module || ''}');
    }`;
}
