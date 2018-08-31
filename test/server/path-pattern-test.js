const PathPattern = require('../../lib/screenshots/path-pattern');
const expect      = require('chai').expect;
const moment      = require('moment');
const userAgent   = require('useragent');

describe('Screenshot path pattern', () => {
    const parsedUserAgentMock = {
        toVersion: () => {},
        os:        { toVersion: () => {} }
    };

    const createPathPattern = (pattern, data) => {
        data                   = data || {};
        data.now               = data.now || moment();
        data.parsedUserAgent   = data.parsedUserAgent || parsedUserAgentMock;
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
        const pattern         = Object.getOwnPropertyNames(PathPattern.PLACEHOLDERS).map(name => PathPattern.PLACEHOLDERS[name]).join('#');
        const dateStr         = '2010-01-02';
        const timeStr         = '11:12:13';
        const parsedUserAgent = userAgent.parse('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36');
        const data = {
            now:               moment(dateStr + ' ' + timeStr),
            testIndex:         12,
            fileIndex:         34,
            quarantineAttempt: 2,
            fixture:           'fixture',
            test:              'test',
            parsedUserAgent
        };
        const expectedParsedPattern = [
            '2010-01-02',
            '11-12-13',
            '12',
            '34',
            '2',
            'fixture',
            'test',
            'Chrome_68.0.3440_Windows_8.1.0.0',
            'Chrome',
            '68.0.3440',
            'Windows',
            '8.1.0.0'
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
