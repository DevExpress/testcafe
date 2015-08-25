import indentString from 'indent-string';
import escapeHtml from 'escape-html';
import wordwrap from 'wordwrap';
import BaseReporter from './base';

export default class XUnitReporter extends BaseReporter {
    static LINE_WIDTH = 100;

    constructor (task, outStream, formatter) {
        super(task, outStream, formatter);

        this.report             = '';
        this.startTime          = null;
        this.uaList             = null;
        this.currentFixtureName = null;
    }

    _reportTaskStart (startTime, userAgents) {
        this.startTime = startTime;

        this.uaList = userAgents
            .map(ua => ua.toString())
            .join(', ');
    }

    _reportFixtureStart (name) {
        this.currentFixtureName = escapeHtml(name);
    }

    _reportTestDone (name, errMsgs, durationMs, unstable) {
        var hasErr = !!errMsgs.length;

        if (unstable)
            name += ' (unstable)';

        name = escapeHtml(name);

        var openTag = `<testcase classname="${this.currentFixtureName}" name="${name}" time="${durationMs / 1000}"`;

        this.report += indentString(openTag, ' ', 2);

        if (hasErr) {
            this.report += ' >\n';
            this.report += indentString('<failure>\n', ' ', 4);
            this.report += indentString('<![CDATA[', ' ', 4);

            errMsgs.forEach((msg, idx) => {
                msg = escapeHtml(`${idx + 1}) ${msg}`);

                this.report += '\n';
                this.report += wordwrap(6, XUnitReporter.LINE_WIDTH)(msg);
                this.report += '\n';
            });

            this.report += indentString(']]>\n', ' ', 4);
            this.report += indentString('</failure>\n', ' ', 4);
            this.report += indentString('</testcase>\n', ' ', 2);
        }
        else
            this.report += ' />\n';
    }

    _reportTaskDone (passed, total, endTime) {
        var name     = `TestCafe Tests: ${escapeHtml(this.uaList)}`;
        var failures = total - passed;
        var time     = (endTime - this.startTime) / 1000;

        this._write('<?xml version="1.0" encoding="UTF-8" ?>')
            ._newline()
            ._write(`<testsuite name="${name}" tests="${total}" failures="${failures}" ` +
                    `errors="${failures}" time="${time}" timestamp="${endTime.toUTCString()}" >`)
            ._newline()
            ._write(this.report)
            ._end('</testsuite>');
    }
}
