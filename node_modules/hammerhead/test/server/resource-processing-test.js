var express = require('express');

var requestAgent = require('../../lib/pipeline/request-agent');
var request      = require('request');
var Proxy        = require('../../lib/proxy');
var Session      = require('../../lib/session');
var expect       = require('chai').expect;
var contentUtils = require('../../lib/utils/content');
var process      = require('../../lib/resource-processing').process;
var ERR          = require('../../lib/errs');


describe('Resource processing', function () {
    var destServer = null;
    var proxy      = null;
    var session    = null;

    // Fixture setup/teardown
    before(function () {
        var app = express();

        app.get('/decoding-error', function (req, res) {
            res.set('content-encoding', 'gzip');
            res.set('content-type', 'text/html; charset=euc-kr');
            res.end('<html></html>');
        });

        app.get('/page', function (req, res) {
            res.set('content-type', 'text/html');
            res.end('<html></html>');
        });

        destServer = app.listen(1335);
    });

    after(function () {
        destServer.close();
    });

    // Test setup/teardown
    beforeEach(function () {
        session = new Session();

        session.getAuthCredentials = function () {
            return null;
        };

        proxy = new Proxy('127.0.0.1', 1836, 1837);
    });

    afterEach(function () {
        proxy.close();
        requestAgent.resetKeepAliveConnections();
    });

    describe('Injection errors', function () {
        it('Decoding error', function (done) {
            session.handlePageError = function (ctx, err) {
                expect(err.code).eql(ERR.INJECTOR_RESOURCE_DECODING_FAILED);
                expect(err.encoding).eql('gzip');
                done();
            };

            var url = proxy.openSession('http://localhost:1335/decoding-error', session);

            var options = {
                method:  'GET',
                url:     url,
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*!/!*;q=0.8'
                }
            };

            request(options, function () {
            });
        });

        it('Encoding error', function (done) {
            var stored = contentUtils.encodeContent;

            // Emulate decoding exception
            contentUtils.encodeContent = function () {
                return Promise(
                    function (resolve, reject) {
                        window.setTimeout(function () {
                            reject({ err: 'decodingError' });
                        }, 10);
                    });
            };

            session.handlePageError = function (ctx, err) {
                expect(err.code).eql(ERR.INJECTOR_RESOURCE_ENCODING_FAILED);
                contentUtils.encodeContent = stored;
                done();
            };

            var url = proxy.openSession('http://localhost:1335/page', session);

            var options = {
                method:  'GET',
                url:     url,
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*!/!*;q=0.8'
                }
            };

            request(options, function () {
            });
        });

        it.skip('Parsing error', function () {
            // TODO:
        });
    });

    describe('Page injection', function () {
        it.skip('Use page charset instead of default', function () {
            // TODO:
        });
    });
});