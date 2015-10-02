import indentString from 'indent-string';
import escapeHtml from 'escape-html';
import wordwrap from '../utils/word-wrap';
import BaseReporter from './base';
import plainTextDecorator from './errors/decorators/plain-text';

export default class XUnitReporter extends BaseReporter {
    constructor (task, outStream) {
        super(task, outStream, plainTextDecorator);

        this.LINE_WIDTH = 100;

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

    _reportTestDone (name, errs, durationMs, unstable) {
        var hasErr = !!errs.length;

        if (unstable)
            name += ' (unstable)';

        name = escapeHtml(name);

        var openTag = `<testcase classname="${this.currentFixtureName}" name="${name}" time="${durationMs / 1000}"`;

        this.report += indentString(openTag, ' ', 2);

        if (hasErr) {
            this.report += ' >\n';
            this.report += indentString('<failure>\n', ' ', 4);
            this.report += indentString('<![CDATA[', ' ', 4);

            errs.forEach((err, idx) => {
                err = escapeHtml(this._formatError(err, `${idx + 1}) `));

                this.report += '\n';
                this.report += wordwrap(err, 6, this.LINE_WIDTH);
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
