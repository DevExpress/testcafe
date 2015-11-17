import moment from 'moment';
import 'moment-duration-format';
import BaseReporter from './base';


export default class SpecReporter extends BaseReporter {
    constructor (task, outStream, errorDecorator) {
        super(task, outStream, errorDecorator);

        this.useWordWrap  = true;
        this.startTime    = null;
        this.afterErrList = false;
    }

    _reportTaskStart (startTime, userAgents) {
        var uaList = userAgents
            .map(ua => this.chalk.blue(ua))
            .join(', ');

        this.startTime = startTime;
        this.indent    = 0;

        this._write(this.chalk.bold(`Running tests in: ${uaList}`))
            ._newline();
    }

    _reportFixtureStart (name, path) {
        var title = `${name} (${this.chalk.underline(path)})`;

        this.indent = 2;

        if (this.afterErrList)
            this.afterErrList = false;
        else
            this._newline();

        this._write(title)
            ._newline();
    }

    _reportTestDone (name, errs, durationMs, unstable, screenshotPath) {
        var hasErr    = !!errs.length;
        var nameStyle = hasErr ? this.chalk.red : this.chalk.gray;
        var symbol    = hasErr ? this.chalk.red(this.symbols.err) : this.chalk.green(this.symbols.ok);
        var title     = `${symbol} ${nameStyle(name)}`;

        this.indent = 4;

        if (unstable)
            title += this.chalk.yellow(' (unstable)');

        if (screenshotPath)
            title += ` (screenshots: ${this.chalk.underline(screenshotPath)})`;

        this._write(title);

        if (hasErr) {
            this.indent = 8;

            this._newline();

            errs.forEach((err, idx) => {
                this._newline()
                    ._write(this._formatError(err, `${idx + 1}) `))
                    ._newline()
                    ._newline();
            });
        }

        this.afterErrList = hasErr;

        this._newline();
    }

    _reportTaskDone (passed, total, endTime) {
        var durationMs  = endTime - this.startTime;
        var durationStr = moment.duration(durationMs).format('h[h] mm[m] ss[s]');
        var footer      = passed === total ?
                          this.chalk.bold.green(`${total} passed`) :
                          this.chalk.bold.red(`${total - passed}/${total} failed`);

        footer += this.chalk.gray(` (${durationStr})`);

        this.indent = 2;

        if (!this.afterErrList)
            this._newline();

        this._newline()
            ._write(footer)
            ._newline()
            ._end();
    }
}
