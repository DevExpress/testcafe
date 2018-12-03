const expect     = require('chai').expect;
const WarningLog = require('../../lib/notifications/warning-log');
const WARNINGS   = require('../../lib/notifications/warning-message');


describe('Warning log', () => {
    it('Should render and store warnings', () => {
        const log = new WarningLog();

        log.addWarning(WARNINGS.screenshotError, 'TypeError');
        log.addWarning(WARNINGS.screenshotError, 'SyntaxError');

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\nTypeError',
            'Was unable to take a screenshot due to an error.\n\nSyntaxError'
        ]);
    });

    it('Should remove duplicates', () => {
        const log = new WarningLog();

        log.addWarning(WARNINGS.screenshotError, 'TypeError');
        log.addWarning(WARNINGS.screenshotError, 'TypeError');

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\nTypeError'
        ]);
    });

    it('Should add messages to the parent log', () => {
        const parentLog = new WarningLog();
        const log       = new WarningLog(parentLog);


        log.addWarning(WARNINGS.screenshotError, 'TypeError');

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\nTypeError'
        ]);

        expect(parentLog.messages).eql([
            'Was unable to take a screenshot due to an error.\n\nTypeError'
        ]);
    });
});
