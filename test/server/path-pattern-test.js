const path        = require('path');
const expect      = require('chai').expect;
const moment      = require('moment');
const userAgent   = require('useragent');
const PathPattern = require('../../lib/utils/path-pattern');


const SCREENSHOT_EXTENSION = 'png';

describe('Screenshot path pattern', () => {
    const TEST_USER_AGENT = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36';

    const createPathPatternData = ({ forQuarantine }) => ({
        now:               moment('2010-01-02 11:12:13'),
        testIndex:         12,
        fileIndex:         34,
        quarantineAttempt: forQuarantine ? 2 : null,
        fixture:           'fixture',
        test:              'test',
        parsedUserAgent:   userAgent.parse(TEST_USER_AGENT)
    });

    const createPathPattern = (pattern, { forQuarantine } = {}) => {
        return new PathPattern(pattern, SCREENSHOT_EXTENSION, createPathPatternData({ forQuarantine }));
    };

    describe('Default pattern', () => {
        it('Normal run', () => {
            const pathPattern = createPathPattern();

            expect(pathPattern.getPath()).match(/2010-01-02_11-12-13[\\/]test-12[\\/]Chrome_68.0.3440_Windows_8.1.0.0[\\/]34.png/);
        });

        it('Quarantine mode', () => {
            const pathPattern = createPathPattern(void 0, { forQuarantine: true });

            expect(pathPattern.getPath()).match(/2010-01-02_11-12-13[\\/]test-12[\\/]run-2[\\/]Chrome_68.0.3440_Windows_8.1.0.0[\\/]34.png/);
        });
    });

    it('Should replace all placeholders', () => {
        const pattern         = Object.getOwnPropertyNames(PathPattern.PLACEHOLDERS).map(name => PathPattern.PLACEHOLDERS[name]).join('#');

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
            '8.1.0.0',
            'test-12',
            'run-2'
        ].join('#') + '.png';

        const pathPattern = createPathPattern(pattern, { forQuarantine: true });

        const resultPath = pathPattern.getPath(false);

        expect(resultPath).eql(expectedParsedPattern);
    });

    it('Should add `errors` folder before filename', () => {
        const pathPattern = createPathPattern('${FILE_INDEX}');
        const resultPath  = pathPattern.getPath(true);

        expect(resultPath).eql(path.join('errors', '1.png'));
    });
});
