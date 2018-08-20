const path            = require('path');
const fs              = require('fs');
const del             = require('del');
const expect          = require('chai').expect;
const correctFilePath = require('../../lib/utils/correct-file-path');
const escapeUserAgent = require('../../lib/utils/escape-user-agent');
const parseFileList   = require('../../lib/utils/parse-file-list');
const TempDirectory   = require('../../lib/utils/temp-directory');


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

    describe('Temp Directory', function () {
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
                .then(() => tempDir1.disposeSync())
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
});
