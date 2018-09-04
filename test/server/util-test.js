const path                             = require('path');
const Module                           = require('module');
const fs                               = require('fs');
const del                              = require('del');
const expect                           = require('chai').expect;
const correctFilePath                  = require('../../lib/utils/correct-file-path');
const escapeUserAgent                  = require('../../lib/utils/escape-user-agent');
const parseFileList                    = require('../../lib/utils/parse-file-list');
const TempDirectory                    = require('../../lib/utils/temp-directory');
const { replaceLeadingSpacesWithNbsp } = require('../../lib/utils/string');
const getCommonPath                    = require('../../lib/utils/get-common-path');


describe('Utils', () => {
    it('Correct File Path', () => {
        expect(correctFilePath('\\test')).eql('/test');
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
    });

    describe('Temp Directory', () => {
        const TMP_ROOT = path.join(process.cwd(), '__tmp__');

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
        const pathFragemts = ['home', 'user1', 'tmp'];
        const path1        = path.join(...pathFragemts);
        const path2        = path.join(pathFragemts[0], pathFragemts[1]);
        const path3        = path.join(pathFragemts[0], pathFragemts[2]);

        expect(getCommonPath([path1])).eql(path1);
        expect(getCommonPath([path1, path1])).eql(path1);
        expect(getCommonPath([path1, path2])).eql(path2);
        expect(getCommonPath([path1, path2, path3])).eql(pathFragemts[0]);
    });

    describe('Moment Module Loader', () => {
        const moduleCacheDesciptor    = Object.getOwnPropertyDescriptor(Module, '_cache');
        const originalLoad            = Module._load;

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
});
