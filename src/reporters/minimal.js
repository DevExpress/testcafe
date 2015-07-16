import BaseReporter from './base';

export default class MinimalReporter extends BaseReporter {
    static NEW_LINE = '\n  ';

    constructor (task, outStream, formatter) {
        super(task, outStream, formatter);

        this.spaceLeft          = 0;
        this.errs               = [];
        this.currentFixtureName = null;
    }

    _reportTaskStart () {
        // NOTE: do nothing
    }

    _reportFixtureStart (name) {
        this.currentFixtureName = name;
    }

    _reportTestDone (name, errMsgs) {
        var hasErr = !!errMsgs.length;
        var dot    = hasErr ? this.style.red('.') : '.';

        /* eslint-disable indent */
        //NOTE: eslint disabled because of the https://github.com/eslint/eslint/issues/2343 issue
        if (this.spaceLeft - 1 < 0) {
            this.spaceLeft = this.viewportWidth - MinimalReporter.NEW_LINE.length - 1;
            this._write(MinimalReporter.NEW_LINE);
        }
        else
            this.spaceLeft--;
        /* eslint-enable indent */

        this._write(dot);

        if (hasErr) {
            this.errs = this.errs.concat(errMsgs.map((msg) => {
                return {
                    msg:         msg,
                    testName:    name,
                    fixtureName: this.currentFixtureName
                };
            }));
        }
    }

    _reportTaskDone (passed, total) {
        var allPassed = !this.errs.length;
        var footer    = allPassed ?
                        this.style.bold.green(`${total} passed`) :
                        this.style.bold.red(`${total - passed}/${total} failed`);

        this.indent = 2;

        this._newline()
            ._newline()
            ._write(footer)
            ._newline();

        if (!allPassed) {
            this.useWordWrap = true;

            this.errs.forEach((err, idx) => {
                var prefix = `${idx + 1}) `;
                var title  = this.style.bold.red(`${prefix}${err.fixtureName} - ${err.testName}`);

                this.indent = 2;

                this._newline()
                    ._write(title)
                    ._newline();

                this.indent = 2 + prefix.length;

                this._write(this.style.red(err.msg))
                    ._newline();
            });
        }

        this._end();
    }
}
