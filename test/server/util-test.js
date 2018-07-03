const expect          = require('chai').expect;
const correctFilePath = require('../../lib/utils/correct-file-path');
const escapeUserAgent = require('../../lib/utils/escape-user-agent');

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
});
