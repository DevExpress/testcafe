import BrowserConsoleMessages from '../../test-run/browser-console-messages';
import { nativeMethods } from './deps/hammerhead';

export default class ClientBrowserConsoleMessages extends BrowserConsoleMessages {
    constructor (data) {
        super(data, nativeMethods);
    }
}
