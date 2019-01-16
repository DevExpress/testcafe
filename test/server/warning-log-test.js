const expect     = require('chai').expect;
const WarningLog = require('../../lib/notifications/warning-log');
const WARNINGS   = require('../../lib/notifications/warning-message');


const TYPE_ERROR_TEXT   = 'TypeError';
const SYNTAX_ERROR_TEXT = 'SyntaxError';


describe('Warning log', () => {
    it('Should render and store warnings', () => {
        const log = new WarningLog();

        log.addWarning(WARNINGS.screenshotError, TYPE_ERROR_TEXT);
        log.addWarning(WARNINGS.screenshotError, 'SyntaxError');

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\n' + TYPE_ERROR_TEXT,
            'Was unable to take a screenshot due to an error.\n\n' + SYNTAX_ERROR_TEXT
        ]);
    });

    it('Should remove duplicates', () => {
        const log = new WarningLog();

        log.addWarning(WARNINGS.screenshotError, TYPE_ERROR_TEXT);
        log.addWarning(WARNINGS.screenshotError, TYPE_ERROR_TEXT);

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\n' + TYPE_ERROR_TEXT
        ]);
    });

    it('Should add messages to the parent log', () => {
        const globalLog = new WarningLog();
        const log       = new WarningLog(globalLog);


        log.addWarning(WARNINGS.screenshotError, TYPE_ERROR_TEXT);

        expect(log.messages).eql([
            'Was unable to take a screenshot due to an error.\n\n' + TYPE_ERROR_TEXT
        ]);

        expect(globalLog.messages).eql([
            'Was unable to take a screenshot due to an error.\n\n' + TYPE_ERROR_TEXT
        ]);
    });
});
