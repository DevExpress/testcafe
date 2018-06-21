const PathPattern = require('../../lib/screenshots/path-pattern');
const expect      = require('chai').expect;
const moment      = require('moment');

describe('Screenshot path pattern', () => {
    const createPathPattern = (pattern, data) => {
        data                   = data || {};
        data.now               = data.now || moment();
        data.parsedUserAgent   = data.parsedUserAgent || {};
        data.quarantineAttempt = data.quarantineAttempt || null;

        return new PathPattern(pattern, data);
    };

    describe('Default pattern', () => {
        it('Normal run', () => {
            const pathPattern = createPathPattern();

            expect(pathPattern.pattern).eql('${DATE}_${TIME}\\test-${TEST_INDEX}\\${USERAGENT}\\${FILE_INDEX}.png');
        });

        it('Quarantine mode', () => {
            const pathPattern = createPathPattern(void 0, { quarantineAttempt: 1 });

            expect(pathPattern.pattern).eql('${DATE}_${TIME}\\test-${TEST_INDEX}\\run-${QUARANTINE_ATTEMPT}\\${USERAGENT}\\${FILE_INDEX}.png');
        });
    });

    it('Should replace all placeholders', () => {
        const pattern = Object.getOwnPropertyNames(PathPattern.PLACEHOLDERS).map(name => PathPattern.PLACEHOLDERS[name]).join('#');
        const dateStr = '2010-01-02';
        const timeStr = '11:12:13';
        const data = {
            now:               moment(dateStr + ' ' + timeStr),
            testIndex:         12,
            fileIndex:         34,
            quarantineAttempt: 56,
            fixture:           'fixture',
            test:              'test',
            parsedUserAgent:   {
                browser:        'Chrome',
                browserVersion: '67.0.3396',
                os:             'Windows',
                osVersion:      '8.1.0.0',
                toString:       function () {
                    return 'full_user_agent';
                }
            }
        };
        const expectedParsedPattern = [
            dateStr,
            timeStr.replace(/:/g, '-'),
            data.testIndex,
            data.fileIndex,
            data.quarantineAttempt,
            data.fixture,
            data.test,
            data.parsedUserAgent.toString(),
            data.parsedUserAgent.browser,
            data.parsedUserAgent.browserVersion,
            data.parsedUserAgent.os,
            data.parsedUserAgent.osVersion
        ].join('#') + '.png';

        const pathPattern = createPathPattern(pattern, data);

        const path = pathPattern.getPath(false);

        expect(path).eql(expectedParsedPattern);
    });

    it('Should add `errors` folder before filename', () => {
        const pathPattern = createPathPattern('${FILE_INDEX}');
        const path        = pathPattern.getPath(true);

        expect(path).eql('errors/1.png');
    });
});
