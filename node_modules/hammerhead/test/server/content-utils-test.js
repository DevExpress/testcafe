var expect       = require('chai').expect;
var Promise      = require('promise');
var contentUtils = require('../../lib/utils/content');

describe('Content utils', function () {

    describe('encodeContent() and decodeContent()', function () {
        var src = new Buffer('Answer to the Ultimate Question of Life, the Universe, and Everything.');

        it('Should encode and decode content', function (done) {
            function testConfiguration (encoding, charset) {
                return contentUtils.encodeContent(src, encoding, charset).then(function (encoded) {
                    return contentUtils.decodeContent(encoded, encoding, charset).then(function (decoded) {
                        expect(decoded.toString()).eql(src.toString());
                    });
                });
            }

            Promise
                .all([
                    testConfiguration(null, 'utf8'),
                    testConfiguration('gzip', 'utf8'),
                    testConfiguration('deflate', 'utf8'),
                    testConfiguration('deflate', 'win1251'),
                    testConfiguration(null, 'iso-8859-1')
                ])
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should handle decoding errors', function (done) {
            contentUtils
                .decodeContent(src, 'deflate', 'utf-8')
                .catch(function (err) {
                    expect(err).to.be.an('object');
                    done();
                });
        });
    });

});