import { GlobalsAPIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import handleTagArgs from '../../utils/handle-tag-args';

const PROTOCOL_RE          = /^https?:\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

export default class Fixture {
    constructor (name, filename) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new GlobalsAPIError('fixture', null, MESSAGE.fixtureNameIsNotAString, nameType);

        this.name    = name;
        this.path    = filename;
        this.pageUrl = 'about:blank';
    }

    page (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        var urlType = typeof this.pageUrl;

        if (urlType !== 'string')
            throw new GlobalsAPIError('page', null, MESSAGE.fixturePageIsNotAString, urlType);

        if (!PROTOCOL_RE.test(this.pageUrl)) {
            var protocol = IMPLICIT_PROTOCOL_RE.test(this.pageUrl) ? 'http:' : 'http://';

            this.pageUrl = protocol + this.pageUrl;
        }
    }
}
