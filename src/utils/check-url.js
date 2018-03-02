import { escapeRegExp as escapeRe } from 'lodash';

const wildcardPlaceholder         = '-!_!-';
const startsWithWildcardRegExp    = /^\*\./;
const endsWithWildcardRegExp      = /\.\*$/;
const containsWildcardRegExp      = /\.\*/g;
const trailingSlashesRegExp       = /\/.*$/;
const portRegExp                  = /:(\d+)$/;
const protocolRegExp              = /^(\w+):\/\//;
const containsWildcardPlaceholder = new RegExp(wildcardPlaceholder, 'g');

function parseUrl (url) {

    let protocol = url.match(protocolRegExp);

    protocol = protocol ? protocol[1] : null;
    url      = url.replace(protocolRegExp, '');
    url      = url.replace(trailingSlashesRegExp, '');

    let port = url.match(portRegExp);

    port = port ? parseInt(port[1], 10) : null;
    url  = url.replace(portRegExp, '');
    url  = url.replace(startsWithWildcardRegExp, '.');
    url  = url.replace(endsWithWildcardRegExp, '.');
    url  = url.replace(containsWildcardRegExp, '.' + wildcardPlaceholder);

    return { protocol, url, port };
}

function matchUrl (sourceUrl, rule) {
    const matchByProtocols = !rule.protocol || !sourceUrl.protocol || rule.protocol === sourceUrl.protocol;
    const matchByPorts = !rule.port || sourceUrl.port === rule.port;
    const domainRequiredBeforeRule = rule.url.startsWith('.');
    const domainRequiredAfterRule = rule.url.endsWith('.');

    let regExStr = '^';

    if (domainRequiredBeforeRule)
        regExStr += '.+';

    regExStr += escapeRe(rule.url).replace(containsWildcardPlaceholder, '.*');

    if (domainRequiredAfterRule)
        regExStr += '.+';

    regExStr += '$';

    return new RegExp(regExStr).test(sourceUrl.url) && matchByProtocols && matchByPorts;
}

export default function (url, rules) {
    url = parseUrl(url);

    if (!Array.isArray(rules))
        rules = [ rules ];

    const parsedRules = rules.map(rule => parseUrl(rule));

    return parsedRules.some(rule => matchUrl(url, rule));

}
