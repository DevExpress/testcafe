process.argv = [
    process.argv0,
    'testcafe',
    'chrome',
    'test.js',
    '-r',
    'list,json:report.json'
];

require('./lib/cli');
