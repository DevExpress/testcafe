import { find, assignIn } from 'lodash';
import { Parser } from 'parse5';
import { renderers } from 'callsite-record';
import TEMPLATES from './templates';
import createStackFilter from '../create-stack-filter';

const parser = new Parser();

export default class TestRunErrorFormattableAdapter {
    constructor (err, metaInfo) {
        this.TEMPLATES = TEMPLATES;

        this.userAgent      = metaInfo.userAgent;
        this.screenshotPath = metaInfo.screenshotPath;
        this.testRunPhase   = metaInfo.testRunPhase;

        assignIn(this, err);

        this.callsite = this.callsite || metaInfo.callsite;
    }

    static _getSelector (node) {
        const classAttr = find(node.attrs, { name: 'class' });
        const cls       = classAttr && classAttr.value;

        return cls ? `${node.tagName} ${cls}` : node.tagName;
    }

    static _decorateHtml (node, decorator) {
        let msg = '';

        if (node.nodeName === '#text')
            msg = node.value;
        else {
            if (node.childNodes.length) {
                msg += node.childNodes
                    .map(childNode => TestRunErrorFormattableAdapter._decorateHtml(childNode, decorator))
                    .join('');
            }

            if (node.nodeName !== '#document-fragment') {
                const selector = TestRunErrorFormattableAdapter._getSelector(node);

                msg = decorator[selector](msg, node.attrs);
            }
        }

        return msg;
    }

    getErrorMarkup (viewportWidth) {
        return this.TEMPLATES[this.code](this, viewportWidth);
    }

    getCallsiteMarkup () {
        if (!this.callsite)
            return '';

        // NOTE: for raw API callsites
        if (typeof this.callsite === 'string')
            return this.callsite;

        try {
            return this.callsite.renderSync({
                renderer:    renderers.html,
                stackFilter: createStackFilter(Error.stackTraceLimit)
            });
        }
        catch (err) {
            return '';
        }
    }

    formatMessage (decorator, viewportWidth) {
        const msgHtml  = this.getErrorMarkup(viewportWidth);
        const fragment = parser.parseFragment(msgHtml);

        return TestRunErrorFormattableAdapter._decorateHtml(fragment, decorator);
    }
}
