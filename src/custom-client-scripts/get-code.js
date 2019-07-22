import { processScript } from 'testcafe-hammerhead';
import INTERNAL_PROPERTIES from '../client/driver/internal-properties';

export default function getCustomClientScriptCode (script) {
    return `try {
        ${processScript(script.content)}
    }
    catch (e) {
       window['${INTERNAL_PROPERTIES.testCafeDriverInstance}'].onCustomClientScriptError(e, '${script.module || ''}');
    }`;
}
