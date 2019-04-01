const path                             = require('path');
const { PassThrough }                  = require('stream');
const Module                           = require('module');
const fs                               = require('fs');
const del                              = require('del');
const OS                               = require('os-family');
const { expect }                       = require('chai');
const { noop }                         = require('lodash');
const correctFilePath                  = require('../../lib/utils/correct-file-path');
const escapeUserAgent                  = require('../../lib/utils/escape-user-agent');
const parseFileList                    = require('../../lib/utils/parse-file-list');
const TempDirectory                    = require('../../lib/utils/temp-directory');
const { getConcatenatedValuesString }  = require('../../lib/utils/string');
const getCommonPath                    = require('../../lib/utils/get-common-path');
const resolvePathRelativelyCwd         = require('../../lib/utils/resolve-path-relatively-cwd');
const getFilterFn                      = require('../../lib/utils/get-filter-fn');
const prepareReporters                 = require('../../lib/utils/prepare-reporters');
const { replaceLeadingSpacesWithNbsp } = require('../../lib/errors/test-run/utils');

const {
    buildChromeArgs,
    IN_DOCKER_FLAGS
} = require('../../lib/browser/provider/built-in/dedicated/chrome/build-chrome-args');

describe('Utils', () => {
    it('Correct File Path', () => {
        expect(correctFilePath('\\test')).eql(path.sep + 'test');
        expect(correctFilePath('"')).eql('');
        expect(correctFilePath('test.png', 'test.png'));
        expect(correctFilePath('test', 'png')).eql('test.png');
    });

    it('Escape user agent', () => {
        expect(escapeUserAgent('Chrome 67.0.3396 / Windows 8.1.0.0')).eql('Chrome_67.0.3396_Windows_8.1.0.0');
    });

    describe('Parse file list', () => {
        it('Default directories', () => {
            const workingDir = path.join(__dirname, './data/file-list');

            const expectedFiles = [
                'test/test-dir-file.js',
                'tests/tests-dir-file.js'
            ].map(file => {
                return path.resolve(workingDir, file);
            });

            return parseFileList(void 0, workingDir)
                .then(actualFiles => {
                    expect(actualFiles).eql(expectedFiles);
                });
        });

        it('File, directory and glob pattern', () => {
            const cwd = process.cwd();

            const expectedFiles = [
                'test/server/data/file-list/file-1.js',
                'test/server/data/file-list/file-2.js',
                'test/server/data/file-list/dir1/dir1-1/file-1-1-1.js',
                'test/server/data/file-list/dir1/file-1-1.js',
                'test/server/data/file-list/dir1/file-1-2.js',
                'test/server/data/file-list/dir1/file-1-3.testcafe',
                'test/server/data/file-list/dir1/file-1-4.ts',
                'test/server/data/file-list/dir2/file-2-2.js',
                'test/server/data/file-list/dir2/file-2-3.js'
            ].map(file => {
                return path.resolve(cwd, file);
            });

            return parseFileList([
                'test/server/data/file-list/file-1.js',
                path.join(cwd, 'test/server/data/file-list/file-2.js'),
                'test/server/data/file-list/dir1',
                'test/server/data/file-list/dir2/*.js',
                '!test/server/data/file-list/dir2/file-2-1.js',
                'test/server/data/file-list/dir3'
            ], cwd).then(actualFiles => {
                expect(actualFiles).eql(expectedFiles);
            });
        });

        if (OS.win) {
            it('File on same drive but with different letter case in label (win only)', () => {
                const { root, dir, base } = path.parse(process.cwd());

                const cwd1 = path.join(root.toLowerCase(), path.relative(root, dir), base);
                const cwd2 = path.join(root.toUpperCase(), path.relative(root, dir), base);

                const sources  = [path.resolve(cwd1, 'test/server/data/file-list/file-1.js')];
                const expected = [path.resolve(cwd2, 'test/server/data/file-list/file-1.js')];

                return parseFileList(sources, cwd2).then(actualFiles => {
                    expect(actualFiles).eql(expected);
                });
            });
        }
    });

    describe('Temp Directory', () => {
        const TMP_ROOT     = resolvePathRelativelyCwd('__tmp__');
        const savedTmpRoot = TempDirectory.TEMP_DIRECTORIES_ROOT;

        beforeEach(() => {
            TempDirectory.TEMP_DIRECTORIES_ROOT = TMP_ROOT;

            return del(TMP_ROOT);
        });

        afterEach(() => {
            TempDirectory.TEMP_DIRECTORIES_ROOT = savedTmpRoot;

            return del(TMP_ROOT);
        });

        it('Should reuse existing temp directories after synchronous disposal', function () {
            const tempDir1 = new TempDirectory();
            const tempDir2 = new TempDirectory();
            const tempDir3 = new TempDirectory();

            return tempDir1
                .init()
                .then(() => tempDir2.init())
                .then(() => tempDir1._disposeSync())
                .then(() => tempDir3.init())
                .then(() => {
                    const subDirs = fs.readdirSync(TempDirectory.TEMP_DIRECTORIES_ROOT);

                    expect(subDirs.length).eql(2);
                    expect(tempDir3.path).eql(tempDir1.path);
                });
        });

        it('Should remove temp directories after asynchronous disposal', function () {
            const tempDir = new TempDirectory();

            return tempDir
                .init()
                .then(() => {
                    const subDirs = fs.readdirSync(TempDirectory.TEMP_DIRECTORIES_ROOT);

                    expect(subDirs.length).eql(1);
                })
                .then(() => tempDir.dispose())
                .then(() => {
                    const subDirs = fs.readdirSync(TempDirectory.TEMP_DIRECTORIES_ROOT);

                    expect(subDirs.length).eql(0);
                });
        });
    });

    it('Replace leading spaces with &nbsp', () => {
        expect(replaceLeadingSpacesWithNbsp('test')).eql('test');
        expect(replaceLeadingSpacesWithNbsp(' test')).eql('&nbsp;test');
        expect(replaceLeadingSpacesWithNbsp('  test')).eql('&nbsp;&nbsp;test');
        expect(replaceLeadingSpacesWithNbsp(' test1 test2 ')).eql('&nbsp;test1 test2 ');
        expect(replaceLeadingSpacesWithNbsp('  test1\n test2 \r\ntest3 ')).eql('&nbsp;&nbsp;test1\n&nbsp;test2 \r\ntest3 ');
    });

    it('Get common path', () => {
        const winPaths  = ['D:\\home', 'D:\\home\\user\\tmp', 'D:\\home\\user', 'D:\\home\\temp'];
        const unixPaths = ['/home', '/home/user/tmp', '/home/user', '/home/temp'];
        const paths     = path.sep === '/' ? unixPaths : winPaths;

        expect(getCommonPath([paths[1]])).eql(paths[1]);
        expect(getCommonPath([paths[1], paths[1]])).eql(paths[1]);
        expect(getCommonPath([paths[1], paths[2]])).eql(paths[2]);
        expect(getCommonPath([paths[1], paths[2], paths[3]])).eql(paths[0]);
    });

    describe('Get Filter Fn', () => {
        it('Should return "undefined" if no filtering options were specified', () => {
            expect(getFilterFn({})).is.undefined;
        });

        it('Should filter by a test name', () => {
            const filter = getFilterFn({ test: 'test' });

            expect(filter('test', void 0, void 0, void 0, void 0)).to.be.true;
            expect(filter('test2', void 0, void 0, void 0, void 0)).to.be.false;
        });

        it('Should filter by a fixture name', () => {
            const filter = getFilterFn({ fixture: 'fixture' });

            expect(filter(void 0, 'fixture', void 0, void 0, void 0)).to.be.true;
            expect(filter(void 0, 'fixture1', void 0, void 0, void 0)).to.be.false;
        });

        it('Should filter by a test name RegExp', () => {
            const filter = getFilterFn({ testGrep: /test\d/ });

            expect(filter('test1', void 0, void 0, void 0, void 0)).to.be.true;
            expect(filter('testX', void 0, void 0, void 0, void 0)).to.be.false;
        });

        it('Should filter by a fixture name RegExp', () => {
            const filter = getFilterFn({ fixtureGrep: /fixture\d/ });

            expect(filter(void 0, 'fixture1', void 0, void 0, void 0)).to.be.true;
            expect(filter(void 0, 'fixtureA', void 0, void 0, void 0)).to.be.false;
        });

        it('Should filter by a test meta', () => {
            const filter = getFilterFn({ testMeta: { test: 'meta' } });

            expect(filter(void 0, void 0, void 0, { test: 'meta' }, void 0)).to.be.true;
            expect(filter(void 0, void 0, void 0, { test: 'metaX' }, void 0)).to.be.false;
        });

        it('Should filter by a fixture meta', () => {
            const filter = getFilterFn({ fixtureMeta: { fixture: 'meta' } });

            expect(filter(void 0, void 0, void 0, void 0, { fixture: 'meta' })).to.be.true;
            expect(filter(void 0, void 0, void 0, void 0, { fixture: 'metaX' })).to.be.false;
        });
    });

    it('Get concatenated values string', () => {
        expect(getConcatenatedValuesString(['param_1'])).eql('"param_1"');
        expect(getConcatenatedValuesString(['param_1', 'param_2', 'param_3'])).eql('"param_1", "param_2", "param_3"');
    });

    describe('Moment Module Loader', () => {
        const moduleCacheDesciptor = Object.getOwnPropertyDescriptor(Module, '_cache');
        const originalLoad         = Module._load;

        beforeEach(() => {
            for (const cachedModule of Object.keys(require.cache))
                delete require.cache[cachedModule];
        });

        afterEach(() => {
            Module._load = originalLoad;

            Object.defineProperty(Module, '_cache', moduleCacheDesciptor);
        });

        it('Should work when multiple moment modules are installed (GH-1750)', () => {
            const momentModulePath = require.resolve('moment');

            for (const cachedModule of Object.keys(require.cache))
                delete require.cache[cachedModule];

            Module._load = function (...args) {
                const modulePath = Module._resolveFilename(...args);

                // NOTE: Remove cached moment module to simulate multiple installations of moment
                if (modulePath === modulePath)
                    delete Module._cache[momentModulePath];

                return originalLoad.apply(this, args);
            };

            const moment = require('../../lib/utils/moment-loader');

            expect(moment.duration.format).to.be.ok;
        });

        it('Should work when modules cache is disabled (GH-2500)', () => {
            Object.defineProperty(Module, '_cache', {
                enumerable:   true,
                configurable: true,

                get: () => Object.create(null),
                set: v => v
            });

            const moment = require('../../lib/utils/moment-loader');

            expect(moment.duration.format).to.be.ok;
        });
    });

    describe('Prepare reporters', () => {
        it('Single string name', () => {
            const result = prepareReporters('minimal');

            expect(result).instanceOf(Array);
            expect(result.length).eql(1);
            expect(result[0].name).eql('minimal');
            expect(result[0].output).is.undefined;
        });

        it('Array of string names', () => {
            const result = prepareReporters(['json', 'minimal']);

            expect(result.length).eql(2);
            expect(result[0].name).eql('json');
            expect(result[1].name).eql('minimal');
        });

        it('Function as reporter name', () => {
            const fn1 = function () {
            };
            const fn2 = function () {
            };

            const result = prepareReporters([fn1, fn2]);

            expect(result.length).eql(2);
            expect(result[0].name).eql(fn1);
            expect(result[1].name).eql(fn2);
        });

        it('Name and output stream', () => {
            const result = prepareReporters('minimal', 'path/to/file');

            expect(result.length).eql(1);
            expect(result[0].name).eql('minimal');
            expect(result[0].output).eql('path/to/file');
        });

        it('Array of names and output streams', () => {
            const data = [
                {
                    name:      'minimal',
                    outStream: 'path/to/file/1'
                },
                {
                    name:      'json',
                    outStream: 'path/to/file/2'
                }
            ];

            const result = prepareReporters(data);

            expect(result).eql(data);
        });

        it('Reporter output validation', () => {
            const shouldThrowCases = [
                {},
                null,
                9,
                function () {
                }
            ];

            shouldThrowCases.forEach(output => {
                expect(() => {
                    prepareReporters('test', output);
                }).to.throw("Specify a file name or a writable stream as the reporter's output target");
            });

            const shouldNotThrowCases = [
                void 0,
                'path/to/file',
                {
                    write: noop,
                    end:   noop
                },
                new PassThrough()
            ];

            shouldNotThrowCases.forEach(output => {
                expect(() => {
                    prepareReporters('test', output);
                }).to.not.throw();
            });
        });
    });

    it('Build Chrome arguments', () => {
        const config = {
            userProfile: false,
            headless:    false,
            userArgs:    ''
        };

        const cdpPort      = '';
        const platformArgs = '--no-first-run';

        const tempProfileDir = {
            path: '/temp/testcafe/chrome-profile-34904xxzNmO5Vkbtz'
        };

        let chromeArgs = '';

        const IN_DOCKER_FLAGS_RE       = new RegExp(IN_DOCKER_FLAGS.join(' '));
        const SANDBOX_FLAG_RE          = new RegExp('--no-sandbox');
        const DISABLE_DEV_SHM_USAGE_RE = new RegExp('--disable-dev-shm-usage');
        let inDockerFlagMatch    = null;

        chromeArgs        = buildChromeArgs({ config, cdpPort, platformArgs, tempProfileDir, inDocker: false });
        inDockerFlagMatch = chromeArgs.match(IN_DOCKER_FLAGS_RE);
        expect(inDockerFlagMatch).eql(null);

        chromeArgs        = buildChromeArgs({ config, cdpPort, platformArgs, tempProfileDir, inDocker: true });
        inDockerFlagMatch = chromeArgs.match(IN_DOCKER_FLAGS_RE);
        expect(inDockerFlagMatch.length).eql(1);

        // NOTE: Flag should not be duplicated
        config.userArgs = '--no-sandbox --disable-dev-shm-usage';
        chromeArgs        = buildChromeArgs({ config, cdpPort, platformArgs, tempProfileDir, inDocker: true });
        inDockerFlagMatch = chromeArgs.match(SANDBOX_FLAG_RE);
        expect(inDockerFlagMatch.length).eql(1);
        inDockerFlagMatch = chromeArgs.match(DISABLE_DEV_SHM_USAGE_RE);
        expect(inDockerFlagMatch.length).eql(1);
    });
});
