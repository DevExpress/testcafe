import { getAjaxProxyUrl } from '../deps/hammerhead';

export default function executeGetAjaxProxyUrl (command) {
    return getAjaxProxyUrl(command.url, command.opts);
}
