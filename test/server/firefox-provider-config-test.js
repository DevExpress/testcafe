var expect          = require('chai').expect;
var OS              = require('os-family');
var getFirefoxConfig = require('../../lib/browser/provider/built-in/firefox/config.js');


describe('Firefox provider config parser', function () {
    it('Should parse options and arguments', function () {
        var config = getFirefoxConfig('/firefox/path/with\\::headless:marionettePort=22822: --arg1 --arg2');

        expect(config.path).to.equal('/firefox/path/with:');
        expect(config.userProfile).to.be.false;
        expect(config.headless).to.be.true;
        expect(config.marionettePort).to.be.equal('22822');

        expect(config.userArgs).to.equal('--arg1 --arg2');
    });

    it('Should support userProfile mode', function () {
        var config = getFirefoxConfig('userProfile');

        expect(config.userProfile).to.be.true;

        config = getFirefoxConfig('-P user');

        expect(config.userProfile).to.be.true;

        config = getFirefoxConfig('-profile /home/user');

        expect(config.userProfile).to.be.true;
    });

    if (OS.win) {
        it('Should allow unescaped colon as disk/path separator on Windows', function () {
            var config = getFirefoxConfig('C:\\Firefox\\firefox.exe:userProfile');

            expect(config.path).to.eql('C:\\Firefox\\firefox.exe');
            expect(config.userProfile).to.be.true;
        });
    }
});
