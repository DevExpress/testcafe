import { processScript } from 'testcafe-hammerhead';
import INTERNAL_PROPERTIES from '../client/driver/internal-properties';
import ClientScript from './client-script';

export default function getCustomClientScriptCode (script: ClientScript, nativeAutomation: boolean): string {
    const scriptCode = nativeAutomation ? script.content : processScript(script.content);

    return `try {
        ${scriptCode}
    }
    catch (e) {
       window['${INTERNAL_PROPERTIES.testCafeDriverInstance}'].onCustomClientScriptError(e, '${script.module || ''}');
    }`;
}
