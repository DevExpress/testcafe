var expect   = require('chai').expect;
var matchUrl = require('../../lib/utils/check-url');

it('Should check does url match rule', function () {
    var rule = 'google.com';

    expect(matchUrl('google.com.uk', rule)).to.be.false;
    expect(matchUrl('docs.google.com', rule)).to.be.false;
    expect(matchUrl('http://docs.google.com', rule)).to.be.false;
    expect(matchUrl('https://docs.google.com', rule)).to.be.false;
    expect(matchUrl('www.docs.google.com', rule)).to.be.false;
    expect(matchUrl('http://docs.ggoogle.com', rule)).to.be.false;
    expect(matchUrl('http://goooogle.com', rule)).to.be.false;
    expect(matchUrl('gogoogle.com', rule)).to.be.false;
    expect(matchUrl('http://google.com', rule)).to.be.true;
    expect(matchUrl('https://google.com', rule)).to.be.true;
    expect(matchUrl('https://google.com/', rule)).to.be.true;
    expect(matchUrl('google.com/', rule)).to.be.true;

    rule = 'http://google.com';

    expect(matchUrl('https://google.com', rule)).to.be.false;
    expect(matchUrl('https://google.com/', rule)).to.be.false;
    expect(matchUrl('docs.google.com', rule)).to.be.false;
    expect(matchUrl('http://docs.google.com', rule)).to.be.false;
    expect(matchUrl('https://docs.google.com', rule)).to.be.false;
    expect(matchUrl('www.docs.google.com', rule)).to.be.false;
    expect(matchUrl('http://docs.ggoogle.com', rule)).to.be.false;
    expect(matchUrl('http://google.com', rule)).to.be.true;
    expect(matchUrl('google.com/', rule)).to.be.true;

    rule = 'https://google.com';

    expect(matchUrl('http://google.com', rule)).to.be.false;
    expect(matchUrl('https://google.com', rule)).to.be.true;

    ['.google.com', '*.google.com'].forEach(r => {
        expect(matchUrl('http://google.com', r)).to.be.false;
        expect(matchUrl('https://google.com', r)).to.be.false;
        expect(matchUrl('https://google.com/', r)).to.be.false;
        expect(matchUrl('google.com/', r)).to.be.false;
        expect(matchUrl('http://docs.ggoogle.com', r)).to.be.false;
        expect(matchUrl('docs.google.com', r)).to.be.true;
        expect(matchUrl('http://docs.google.com', r)).to.be.true;
        expect(matchUrl('https://docs.google.com', r)).to.be.true;
        expect(matchUrl('www.docs.google.com', r)).to.be.true;
    });

    ['.com', '*.com'].forEach(r => {
        expect(matchUrl('http://google.com.uk', r)).to.be.false;
        expect(matchUrl('http://google.com', r)).to.be.true;
        expect(matchUrl('google.com/', r)).to.be.true;
        expect(matchUrl('docs.google.com', r)).to.be.true;
        expect(matchUrl('http://docs.google.com', r)).to.be.true;
        expect(matchUrl('www.docs.google.com', r)).to.be.true;
    });

    ['google.', 'google.*'].forEach(r => {
        expect(matchUrl('docs.google.com', r)).to.be.false;
        expect(matchUrl('https://docs.google.co.uk', r)).to.be.false;
        expect(matchUrl('https://docs.google.uk', r)).to.be.false;
        expect(matchUrl('http://google.com', r)).to.be.true;
        expect(matchUrl('https://google.co.uk', r)).to.be.true;
        expect(matchUrl('google.ru/', r)).to.be.true;
    });

    ['docs.google.', 'docs.google.*'].forEach(r => {
        expect(matchUrl('http://google.com', r)).to.be.false;
        expect(matchUrl('docs.google', r)).to.be.false;
        expect(matchUrl('https://docs.googlee.com', r)).to.be.false;
        expect(matchUrl('www.docs.google.co.uk', r)).to.be.false;
        expect(matchUrl('http://docs.ggoogle.com', r)).to.be.false;
        expect(matchUrl('http://___docs.google.com', r)).to.be.false;
        expect(matchUrl('docs.google.en', r)).to.be.true;
        expect(matchUrl('http://docs.google.co.uk', r)).to.be.true;
    });

    ['.google.', '*.google.*'].forEach(r => {
        expect(matchUrl('http://google.com', r)).to.be.false;
        expect(matchUrl('docs.google.com', r)).to.be.true;
        expect(matchUrl('http://docs.google.com', r)).to.be.true;
        expect(matchUrl('www.docs.google.com', r)).to.be.true;
        expect(matchUrl('www.my.docs.google.com', r)).to.be.true;

    });

    ['.docs.google.', '*.docs.google.*'].forEach(r => {
        expect(matchUrl('http://google.com', r)).to.be.false;
        expect(matchUrl('docs.google.com', r)).to.be.false;
        expect(matchUrl('http://docs.google.com', r)).to.be.false;
        expect(matchUrl('www.docs.google.com', r)).to.be.true;
        expect(matchUrl('www.my.docs.google.com.eu', r)).to.be.true;
    });

    rule = 'docs.*.com';

    expect(matchUrl('docs.google.com', rule)).to.be.true;
    expect(matchUrl('docs.google.eu.com', rule)).to.be.true;
    expect(matchUrl('docs.google.ru', rule)).to.be.false;
    expect(matchUrl('docs.google.co.uk', rule)).to.be.false;

    rule = 'docs.*.*.com';

    expect(matchUrl('docs.google.com', rule)).to.be.false;
    expect(matchUrl('docs.google.ru', rule)).to.be.false;
    expect(matchUrl('my.docs.google.ro.eu.com', rule)).to.be.false;
    expect(matchUrl('docs.google.co.uk', rule)).to.be.false;
    expect(matchUrl('docs.google.eu.com', rule)).to.be.true;
    expect(matchUrl('docs.google.ro.eu.com', rule)).to.be.true;

    rule = '.docs.*.*.com.';

    expect(matchUrl('my.docs.google.eu.com.ru', rule)).to.be.true;

    rule = 'docs.g*e.com';

    expect(matchUrl('docs.google.com', rule)).to.be.false;

    rule = 'localhost';

    expect(matchUrl('localhost', rule)).to.be.true;
    expect(matchUrl('http://localhost', rule)).to.be.true;
    expect(matchUrl('my-localhost', rule)).to.be.false;
    expect(matchUrl('localhost-my', rule)).to.be.false;

    rule = '127.0.0.1';

    expect(matchUrl('127.0.0.1', rule)).to.be.true;
    expect(matchUrl('http://127.0.0.1', rule)).to.be.true;
    expect(matchUrl('https://127.0.0.1', rule)).to.be.true;

    rule = '127.0.0.';

    expect(matchUrl('127.127.0.0', rule)).to.be.false;
    expect(matchUrl('127.0.0.2', rule)).to.be.true;

    rule = '.0.0.';

    expect(matchUrl('127.0.1.2', rule)).to.be.false;
    expect(matchUrl('127.0.0.2', rule)).to.be.true;

    rule = '127.*.*.0';

    expect(matchUrl('128.120.120.0', rule)).to.be.false;
    expect(matchUrl('127.0.0.0', rule)).to.be.true;
    expect(matchUrl('127.120.120.0', rule)).to.be.true;

    rule = 'google.com:81';

    expect(matchUrl('google.com', rule)).to.be.false;
    expect(matchUrl('google.com:80', rule)).to.be.false;
    expect(matchUrl('google.com:81', rule)).to.be.true;

    rule = 'google.:81';

    expect(matchUrl('google.com', rule)).to.be.false;
    expect(matchUrl('google.com:80', rule)).to.be.false;
    expect(matchUrl('google.com:81', rule)).to.be.true;

    rule = 'localhost:3000';

    expect(matchUrl('localhost:3000/features/functional/local', rule)).to.be.true;
    expect(matchUrl('http://localhost:3000/features/functional/local', rule)).to.be.true;
    expect(matchUrl(null, rule)).to.be.false;

    rule = 1;
    expect(matchUrl('google', rule)).to.be.false;
});
