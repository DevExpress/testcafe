import hammerhead from '../deps/hammerhead';

const urlUtils = hammerhead.utils.url;

export default async function executeGetProxyUrl (command) {
    if (command.options.isAjax)
        return urlUtils.getAjaxProxyUrl(command.url, command.options);

    return urlUtils.getProxyUrl(command.url, command.options);
}
