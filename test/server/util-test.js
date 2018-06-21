const expect          = require('chai').expect;
const correctFilePath = require('../../lib/utils/correct-file-path');

describe('Utils', () => {
    it('Correct File Path', () => {
        expect(correctFilePath('\\test')).eql('/test');
        expect(correctFilePath('"')).eql('');
        expect(correctFilePath('test.png', 'test.png'));
        expect(correctFilePath('test', 'png')).eql('test.png');
    });
});
