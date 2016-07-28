import { escape as escapeHtml } from 'lodash';
import highlight from 'highlight-es';
import TestRunErrorFormattableAdapter from '../../errors/test-run/formattable-adapter';
import TEMPLATES from './templates';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

var renderer = ['string', 'punctuator', 'keyword', 'number', 'regex', 'comment', 'invalid'].reduce((syntaxRenderer, tokenType) => {
    syntaxRenderer[tokenType] = str => `<span class="syntax-${tokenType}">${escapeHtml(str)}</span>`;

    return syntaxRenderer;
}, {});

export default class LegacyTestRunErrorFormattableAdapter extends TestRunErrorFormattableAdapter {
    constructor (err, metaInfo) {
        super(err, metaInfo);

        this.TEMPLATES = TEMPLATES;
    }

    getCallsiteMarkup () {
        if (!this.callsite)
            return null;

        var code     = highlight(this.callsite, renderer);
        var lines    = code.split(NEWLINE);
        var lastLine = lines.pop();

        lastLine = `<div class="code-line-last">${lastLine}</div>`;
        lines    = lines.map(line => `<div class="code-line"><div class="code-line-src">${line}</div></div>`);

        return `<div class="code-frame">${lines.join('')}${lastLine}</div>`;
    }
}
