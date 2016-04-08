import { find, assignIn } from 'lodash';
import { Parser } from 'parse5';
import { renderers } from 'callsite-record';
import TEMPLATES from './templates';
import stackFilter from '../stack-filter';

var parser = new Parser();

export default class TestRunErrorFormattableAdapter {
    constructor (err, userAgent, screenshotPath, callsite) {
        this.TEMPLATES = TEMPLATES;

        this.userAgent      = userAgent;
        this.screenshotPath = screenshotPath;
        this.callsite       = callsite;

        assignIn(this, err);
    }

    static _getSelector (node) {
        var classAttr = find(node.attrs, { name: 'class' });
        var cls       = classAttr && classAttr.value;

        return cls ? `${node.tagName} ${cls}` : node.tagName;
    }

    static _decorateHtml (node, decorator) {
        var msg = '';

        if (node.nodeName === '#text')
            msg = node.value;
        else {
            if (node.childNodes.length) {
                msg += node.childNodes
                    .map(childNode => TestRunErrorFormattableAdapter._decorateHtml(childNode, decorator))
                    .join('');
            }

            if (node.nodeName !== '#document-fragment') {
                var selector = TestRunErrorFormattableAdapter._getSelector(node);

                msg = decorator[selector](msg, node.attrs);
            }
        }

        return msg;
    }

    getCallsiteMarkup () {
        if (!this.callsite)
            return '';

        // NOTE: for raw API callsites
        if (typeof this.callsite === 'string')
            return this.callsite;

        try {
            return this.callsite.renderSync({ renderer: renderers.html, stackFilter });
        }
        catch (err) {
            return '';
        }
    }

    formatMessage (decorator, viewportWidth) {
        var msgHtml  = this.TEMPLATES[this.type](this, viewportWidth);
        var fragment = parser.parseFragment(msgHtml);

        return TestRunErrorFormattableAdapter._decorateHtml(fragment, decorator);
    }
}
