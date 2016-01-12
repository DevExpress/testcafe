var os = require('os');

var isTravisEnvironment = !!process.env.TRAVIS;
var hostname            = isTravisEnvironment ? os.hostname() : '127.0.0.1';

module.exports = {
    isTravisTask: isTravisEnvironment,
    sauceLabs:    {
        username:  process.env.SAUCE_USERNAME_FUNCTIONAL,
        accessKey: process.env.SAUCE_ACCESS_KEY_FUNCTIONAL,
        build:     process.env.TRAVIS_JOB_ID || '',
        tags:      [process.env.TRAVIS_BRANCH || 'master'],
        name:      'testcafe functional tests'
    },
    browsers: [
        {
            platform:    'Windows 10',
            browserName: 'internet explorer',
            version:     '11.0',
            alias:       'ie'
        },
        {
            platform:    'Windows 10',
            browserName: 'firefox',
            alias:       'ff'
        },
        {
            platform:    'Windows 10',
            browserName: 'chrome',
            alias:       'chrome'
        }
    ],
    testCafe: {
        hostname: hostname,
        port1:    2000,
        port2:    2001
    },
    site: {
        viewsPath: './test/functional/fixtures/',
        port1:     3000,
        port2:     3001
    }
};
