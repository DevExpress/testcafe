import { escapeRegExp as escapeRe } from 'lodash';

const startsWithWildcardRegExp = /^\*\./;
const endsWithWildcardRegExp   = /\.\*$/;
const trailingSlashesRegExp    = /\/.*$/;
const portRegExp               = /:(\d+)$/;
const protocolRegExp           = /^(\w+):\/\//;
const wildcardRegExp           = /\\\.\\\*/g;

function parseUrl (url) {
    if (!url || typeof url !== 'string')
        return null;

    let protocol = url.match(protocolRegExp);

    protocol = protocol ? protocol[1] : null;
    url      = url.replace(protocolRegExp, '');
    url      = url.replace(trailingSlashesRegExp, '');

    let port = url.match(portRegExp);

    port = port ? parseInt(port[1], 10) : null;
    url  = url.replace(portRegExp, '');

    return { protocol, url, port };
}

function prepareRule (url) {
    const rule = parseUrl(url);

    if (rule) {
        rule.url = rule.url.replace(startsWithWildcardRegExp, '.');
        rule.url = rule.url.replace(endsWithWildcardRegExp, '.');
    }

    return rule;
}

function urlMatchRule (sourceUrl, rule) {
    if (!sourceUrl || !rule)
        return false;

    const matchByProtocols         = !rule.protocol || !sourceUrl.protocol || rule.protocol === sourceUrl.protocol;
    const matchByPorts             = !rule.port || sourceUrl.port === rule.port;
    const domainRequiredBeforeRule = rule.url.startsWith('.');
    const domainRequiredAfterRule  = rule.url.endsWith('.');

    let regExStr = '^';

    if (domainRequiredBeforeRule)
        regExStr += '.+';

    regExStr += escapeRe(rule.url).replace(wildcardRegExp, '\\..*');

    if (domainRequiredAfterRule)
        regExStr += '.+';

    regExStr += '$';

    return new RegExp(regExStr).test(sourceUrl.url) && matchByProtocols && matchByPorts;
}

export default function (url, rules) {
    if (!Array.isArray(rules))
        rules = [rules];

    return rules.some(rule => urlMatchRule(parseUrl(url), prepareRule(rule)));
}
