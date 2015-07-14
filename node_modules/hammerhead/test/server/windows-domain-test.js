var platform      = require('os').platform;
var expect        = require('chai').expect;
var windowsDomain = require('../../lib/pipeline/windows-domain');

var IS_WINDOWS = /^win/.test(platform());

describe('Windows domain', function () {
    it('Should assign windows domain and workstation to credentials', function (done) {
        var credentials = {};

        windowsDomain.assign(credentials).then(function () {
            if (IS_WINDOWS) {
                expect(credentials.domain).to.be.a('string');
                expect(credentials.workstation).to.be.a('string');
            }
            else {
                expect(credentials.domain).eql('');
                expect(credentials.workstation).eql('');
            }

            done();
        });
    });
});
