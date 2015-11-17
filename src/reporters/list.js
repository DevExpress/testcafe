import SpecReporter from './spec';

export default class ListReporter extends SpecReporter {
    constructor (task, outStream, errorDecorator) {
        super(task, outStream, errorDecorator);

        this.currentFixtureName = null;
    }

    _reportTaskStart (startTime, userAgents) {
        super._reportTaskStart(startTime, userAgents);

        this._newline();
    }

    _reportFixtureStart (name) {
        this.currentFixtureName = name;
    }

    _reportTestDone (name, errs, durationMs, unstable, screenshotPath) {
        var hasErr    = !!errs.length;
        var nameStyle = hasErr ? this.chalk.red : this.chalk.gray;
        var symbol    = hasErr ? this.chalk.red(this.symbols.err) : this.chalk.green(this.symbols.ok);

        name = `${this.currentFixtureName} - ${name}`;

        var title = `${symbol} ${nameStyle(name)}`;

        this.indent = 2;

        if (unstable)
            title += this.chalk.yellow(' (unstable)');

        if (screenshotPath)
            title += ` (screenshots: ${this.chalk.underline(screenshotPath)})`;

        this._write(title);

        if (hasErr) {
            this.indent = 6;

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
}
