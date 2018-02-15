import { processScript } from '../../../deps/hammerhead';
import evalFunction from '../eval-function';

function sandboxed (fn) {
    var code = `(${fn.toString()})`;

    code = processScript(code, false);

    return evalFunction(code, null);
}

export var getAttrs       = sandboxed(element => element.attributes);
export var getTextContent = sandboxed(node => node.textContent);
export var getClassName   = sandboxed(element => element.className);
export var getInnerText   = sandboxed(element => element.innerText);
