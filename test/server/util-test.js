const path                             = require('path');
const { PassThrough }                  = require('stream');
const EventEmitter                     = require('events');
const Module                           = require('module');
const fs                               = require('fs');
const del                              = require('del');
const OS                               = require('os-family');
const { expect }                       = require('chai');
const { noop }                         = require('lodash');
const proxyquire                       = require('proxyquire');
const sinon                            = require('sinon');
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
const createTempProfile                = require('../../lib/browser/provider/built-in/dedicated/chrome/create-temp-profile');
const parseUserAgent                   = require('../../lib/utils/parse-user-agent');
const diff                             = require('../../lib/utils/diff');


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

    it('Diff', () => {
        expect(diff(null, null)).eql({});
        expect(diff(void 0, void 0)).eql({});
        expect(diff(1, 2)).eql({});
        expect(diff({ a: void 0 }, { b: void 0 })).eql({});
        expect(diff({ a: null }, { b: null })).eql({});
        expect(diff({ a: null }, { a: 1 })).eql({ a: 1 });
        expect(diff({ a: 1 }, { a: 1 })).eql({});
        expect(diff({ a: 1 }, { a: void 0 })).eql({ a: void 0 });
        expect(diff({ a: 1 }, { a: null })).eql({ a: null });
        expect(diff({ a: 1, b: 1 }, { a: 1, b: 1 })).eql({});
        expect(diff({ a: 1, b: {} }, { a: 1, b: {} })).eql({});
        expect(diff({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } })).eql({});
        expect(diff({ a: 1, b: { c: { d: 4 } } }, { a: 1, b: { c: { d: 4 } } })).eql({});
        expect(diff({ a: 0 }, { a: 1 })).eql({ a: 1 });
        expect(diff({ a: 1 }, { a: 0 })).eql({ a: 0 });
        expect(diff({ a: 1 }, { a: 2 })).eql({ a: 2 });
        expect(diff({ a: 1, b: 1 }, { a: 1, b: 2 })).eql({ b: 2 });
        expect(diff({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 4 } })).eql({ b: { c: 4 } });
        expect(diff({ a: 1, b: { c: 3 } }, { a: 2, b: { c: 4 } })).eql({ a: 2, b: { c: 4 } });
        expect(diff({ a: 1, b: { c: { d: 4 } } }, { a: 1, b: { c: { d: 5 } } })).eql({ b: { c: { d: 5 } } });
    });

    it('Parse user agent', () => {
        const expectedEmptyParsedUA = {
            name:            'Other',
            version:         '0.0',
            platform:        'other',
            os:              { name: 'Other', version: '0.0' },
            engine:          { name: 'Other', version: '0.0' },
            prettyUserAgent: 'Other 0.0 / Other 0.0',
            userAgent:       ''
        };

        const testCases = [
            {
                sourceUA: '',
                expected: expectedEmptyParsedUA
            },
            {
                sourceUA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
                expected: {
                    name:            'Chrome',
                    version:         '78.0.3904.70',
                    platform:        'desktop',
                    os:              { name: 'Windows', version: '10' },
                    engine:          { name: 'Blink', version: '0.0' },
                    prettyUserAgent: 'Chrome 78.0.3904.70 / Windows 10',
                    userAgent:       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
                }
            },
            {
                sourceUA: 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
                expected: {
                    name:            'Safari',
                    version:         '12.1',
                    platform:        'tablet',
                    os:              { name: 'iOS', version: '12.2' },
                    engine:          { name: 'WebKit', version: '605.1.15' },
                    prettyUserAgent: 'Safari 12.1 / iOS 12.2',
                    userAgent:       'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
                }
            },
            {
                sourceUA: 'Mozilla/5.0 (Linux; Android 8.1.0; Android SDK built for x86 Build/OSM1.180201.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
                expected: {
                    name:            'Chrome',
                    version:         '67.0.3396.87',
                    platform:        'mobile',
                    os:              { name: 'Android', version: '8.1.0' },
                    engine:          { name: 'Blink', version: '0.0' },
                    prettyUserAgent: 'Chrome 67.0.3396.87 / Android 8.1.0',
                    userAgent:       'Mozilla/5.0 (Linux; Android 8.1.0; Android SDK built for x86 Build/OSM1.180201.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36'
                }
            },
            {
                sourceUA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.130 Electron/7.1.7 Safari/537.36',
                expected: {
                    name:            'Electron',
                    version:         '7.1.7',
                    platform:        'desktop',
                    os:              { name: 'Windows', version: '10' },
                    engine:          { name: 'Blink', version: '0.0' },
                    prettyUserAgent: 'Electron 7.1.7 / Windows 10',
                    userAgent:       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.130 Electron/7.1.7 Safari/537.36'
                }
            }
        ];

        testCases.forEach(testCase => {
            expect(parseUserAgent(testCase.sourceUA)).to.deep.eql(testCase.expected);
        });

        expect(parseUserAgent()).to.deep.eql(expectedEmptyParsedUA);
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

        describe('Cleanup Process', () => {
            const origArgv0 = process.argv[0];

            beforeEach(() => {
                process.argv[0] = origArgv0;
            });

            afterEach(() => {
                process.argv[0] = origArgv0;
            });

            it('Should always start a subprocess using the correct Node.js path (GH-4276)', async () => {
                class FakeChildProcess extends EventEmitter {
                    constructor () {
                        super();

                        this.unref         = noop;
                        this.stdout        = new PassThrough();
                        this.stdout.unref  = noop;
                        this.stderr        = new PassThrough();
                        this.stderr.unref  = noop;
                        this.channel       = new EventEmitter();
                        this.channel.unref = noop;

                        this.on('newListener', () => process.nextTick(() => this.emit('exit')));
                    }
                }

                const fakeSpawn = sinon.stub().returns(new FakeChildProcess());

                process.argv[0] = 'wrong path';

                const cleanupProcess = proxyquire('../../lib/utils/temp-directory/cleanup-process', {
                    'child_process': {
                        spawn: fakeSpawn
                    }
                });

                await cleanupProcess.init();

                expect(fakeSpawn.args[0][0]).contains('node');
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
        expect(getConcatenatedValuesString(['1', '2'], ' ')).eql('"1" "2"');
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

    describe('Create temporary profile for the Google Chrome browser', () => {
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

        it("Without 'disableMultipleWindows' option", async () => {
            const tempDir     = await createTempProfile('testhost', false);
            const profileFile = path.join(tempDir.path, 'Default', 'Preferences');
            const preferences = JSON.parse(fs.readFileSync(profileFile));

            expect(preferences.profile.content_settings.exceptions.popups).eql({ 'testhost': { setting: 1 } });
        });

        it("With 'disableMultipleWindows' option", async () => {
            const tempDir     = await createTempProfile('testhost', true);
            const profileFile = path.join(tempDir.path, 'Default', 'Preferences');
            const preferences = JSON.parse(fs.readFileSync(profileFile));

            expect(preferences.profile.content_settings.exceptions.popups).to.be.undefined;
        });
    });
});
