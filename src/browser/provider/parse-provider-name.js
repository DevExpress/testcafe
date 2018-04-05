const BROWSER_PROVIDER_NAME_RE            = /^(@(?:[^/]+)\/)?(.+)$/;
const BROWSER_PROVIDER_MODULE_NAME_PREFIX = 'testcafe-browser-provider-';


export default function (providerName) {
    let [ , scope, name ] = BROWSER_PROVIDER_NAME_RE.exec(providerName);

    if (!scope)
        scope = '';

    if (name.indexOf(BROWSER_PROVIDER_MODULE_NAME_PREFIX) === 0)
        name = name.replace(BROWSER_PROVIDER_MODULE_NAME_PREFIX, '');

    return {
        providerName: scope + name,
        moduleName:   scope + BROWSER_PROVIDER_MODULE_NAME_PREFIX + name
    };
}
