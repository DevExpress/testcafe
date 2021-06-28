import { assertType, is } from '../errors/runtime/type-assertions';
import ClientScriptInit from './client-script-init';

export default function (scripts: ClientScriptInit[]): void {
    scripts.forEach((script: ClientScriptInit) => assertType([is.string, is.clientScriptInitializer], 'clientScripts', `the client script`, script));
}
