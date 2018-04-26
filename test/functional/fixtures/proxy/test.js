var os     = require('os');
var expect = require('chai').expect;

const TRUSTED_PROXY_URL     = os.hostname() + ':3004';
const TRANSPARENT_PROXY_URL = os.hostname() + ':3005';
const ERROR_PROXY_URL       = 'ERROR';

describe('Using external proxy server', function () {
    it('Should open page via proxy server', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
    });

    it('Should open restricted page via trusted proxy server', function () {
        return runTests('testcafe-fixtures/restricted-page.test.js', null, { useProxy: TRUSTED_PROXY_URL });
    });
});

describe('Using proxy-bypass', function () {
    it('Should bypass using proxy by one rule', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: 'localhost:3000' });
    });

    it('Should bypass using proxy by comma-separated string of rules', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: 'dummy,localhost:3000' });
    });

    it('Should bypass using proxy by array of rules', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: ['dummy', 'localhost:3000'] });
    });

    it('Should bypass using proxy by array of comma-separated strings', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: ['dummy,localhost:3000', 'dummy,localhost:3000'] });
    });

    it('Should fail using proxy-bypass which is set by incorrect argument', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: /dummy/, shouldFail: true })
            .catch(function (err) {
                expect(err.message).contains('proxyBypass" argument is expected to be a string or an array, but it was object.');
            });
    });

    it('Should open page without proxy but get resource with proxy', function () {
        const http = require('http');

        const server = http.createServer(function (req, res) {
            res.write('document.getElementById(\'result\').innerHTML = \'proxy\'');
            res.end();
        }).listen(3006);

        return runTests('testcafe-fixtures/bypass-page-proxy-request.test.js', null, { useProxy: 'localhost:3006', proxyBypass: 'localhost:3000' })
            .then(() => {
                server.close();
            });
    });
});

