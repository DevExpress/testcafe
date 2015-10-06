import BaseReporter from './base';

export default class MinimalReporter extends BaseReporter {
    constructor (task, outStream, errorDecorator) {
        super(task, outStream, errorDecorator);

        this.NEW_LINE = '\n  ';

        this.spaceLeft          = 0;
        this.errDescriptors     = [];
        this.currentFixtureName = null;
    }

    _reportTaskStart () {
        // NOTE: do nothing
    }

    _reportFixtureStart (name) {
        this.currentFixtureName = name;
    }

    _reportTestDone (name, errs) {
        var hasErr = !!errs.length;
        var dot    = hasErr ? this.style.red('.') : '.';

        if (this.spaceLeft - 1 < 0) {
            this.spaceLeft = this.viewportWidth - this.NEW_LINE.length - 1;
            this._write(this.NEW_LINE);
        }
        else
            this.spaceLeft--;

        this._write(dot);

        if (hasErr) {
            this.errDescriptors = this.errDescriptors.concat(errs.map(err => {
                return {
                    err:         err,
                    testName:    name,
                    fixtureName: this.currentFixtureName
                };
            }));
        }
    }

    _reportTaskDone (passed, total) {
        var allPassed = !this.errDescriptors.length;
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

            this.errDescriptors.forEach((errDescriptor, idx) => {
                var prefix = `${idx + 1}) `;
                var title  = this.style.bold.red(`${prefix}${errDescriptor.fixtureName} - ${errDescriptor.testName}`);

                this.indent = 2;

                this._newline()
                    ._write(title)
                    ._newline();

                this.indent = 2 + prefix.length;

                this._write(this._formatError(errDescriptor.err))
                    ._newline()
                    ._newline();
            });
        }

        this._end();
    }
}
