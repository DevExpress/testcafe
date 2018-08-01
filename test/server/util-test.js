const path            = require('path');
const expect          = require('chai').expect;
const correctFilePath = require('../../lib/utils/correct-file-path');
const escapeUserAgent = require('../../lib/utils/escape-user-agent');
const parseFileList   = require('../../lib/utils/parse-file-list');

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

            const actualFiles = parseFileList(void 0, workingDir);

            expect(actualFiles).eql(expectedFiles);
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

            const actualFiles = parseFileList([
                'test/server/data/file-list/file-1.js',
                path.join(cwd, 'test/server/data/file-list/file-2.js'),
                'test/server/data/file-list/dir1',
                'test/server/data/file-list/dir2/*.js',
                '!test/server/data/file-list/dir2/file-2-1.js',
                'test/server/data/file-list/dir3'
            ], cwd);

            expect(actualFiles).eql(expectedFiles);
        });
    });
});
