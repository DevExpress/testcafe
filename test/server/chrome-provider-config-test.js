var expect          = require('chai').expect;
var OS              = require('os-family');
var getChromeConfig = require('../../lib/browser/provider/built-in/chrome/config.js');


describe('Chrome provider config parser', function () {
    it('Should parse options and arguments', function () {
        var config = getChromeConfig('/chrome/path/with\\::headless:emulation:device=iPhone 4;cdpPort=9222 --arg1 --arg2');

        expect(config.path).to.equal('/chrome/path/with:');
        expect(config.userProfile).to.be.false;
        expect(config.headless).to.be.true;
        expect(config.emulation).to.be.true;

        expect(config.mobile).to.be.true;
        expect(config.touch).to.be.true;
        expect(config.width).to.equal(320);
        expect(config.height).to.equal(480);
        expect(config.scaleFactor).to.equal(2);
        expect(config.orientation).to.equal('vertical');
        expect(config.userAgent).to.equal([
            'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us)',
            'AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148',
            'Safari/6533.18.5'
        ].join(' '));

        expect(config.cdpPort).to.equal('9222');
        expect(config.userArgs).to.equal('--arg1 --arg2');
    });

    it('Should parse custom device configuration', function () {
        var config = getChromeConfig('emulation:userAgent=Mozilla/XX\\; Browser/XX.XX.XX;width=800;height=600;scaleFactor=1;touch=false;mobile=true');

        expect(config.emulation).to.be.true;

        expect(config.mobile).to.be.true;
        expect(config.touch).to.be.false;
        expect(config.width).to.equal(800);
        expect(config.height).to.equal(600);
        expect(config.scaleFactor).to.equal(1);
        expect(config.userAgent).to.equal('Mozilla/XX; Browser/XX.XX.XX');
    });

    it('Should provide default values for emulation options', function () {
        var config = getChromeConfig('emulation');

        expect(config.emulation).to.be.true;

        expect(config.mobile).to.be.false;
        expect(config.touch).to.be.undefined;
        expect(config.width).to.equal(0);
        expect(config.height).to.equal(0);
        expect(config.scaleFactor).to.equal(0);
    });

    it('Should provide default values for emulation options in headless mode', function () {
        var config = getChromeConfig('headless');

        expect(config.headless).to.be.true;
        expect(config.emulation).to.be.true;

        expect(config.mobile).to.be.false;
        expect(config.touch).to.be.undefined;
        expect(config.width).to.equal(1280);
        expect(config.height).to.equal(800);
        expect(config.scaleFactor).to.equal(0);
    });

    it('Should support userProfile mode', function () {
        var config = getChromeConfig('userProfile');

        expect(config.userProfile).to.be.true;

        config = getChromeConfig('--user-data-dir=/dev/null');

        expect(config.userProfile).to.be.true;
    });

    if (OS.win) {
        it('Should allow unescaped colon as disk/path separator on Windows', function () {
            var config = getChromeConfig('C:\\Chrome\\chrome.exe:headless');

            expect(config.path).to.eql('C:\\Chrome\\chrome.exe');
            expect(config.headless).to.be.true;
        });
    }
});
