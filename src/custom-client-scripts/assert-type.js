import { assertType, is } from '../errors/runtime/type-assertions';

export default function (scripts) {
    scripts.forEach(script => assertType([is.string, is.clientScriptInitializer], 'clientScripts', `Client script`, script));
}
