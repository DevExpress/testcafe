import { assertType, is } from '../errors/runtime/type-assertions';
import ClientScript from './client-script';

export default function (scripts: ClientScript[]): void {
    scripts.forEach((script: ClientScript) => assertType([is.string, is.clientScriptInitializer], 'clientScripts', `Client script`, script));
}
