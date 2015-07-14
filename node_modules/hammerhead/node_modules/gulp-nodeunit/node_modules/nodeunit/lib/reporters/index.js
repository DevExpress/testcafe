// This is a hack to make browserify skip tap
var tap;
try {
    tap = require('./' + 'tap');
} catch (ex) {
    tap = {
        run: function() {
            throw new Error('Sorry, tap reporter not available');
        }
    };
}

module.exports = {
    'junit': require('./junit'),
    'default': require('./default'),
    'skip_passed': require('./skip_passed'),
    'minimal': require('./minimal'),
    'html': require('./html'),
    'eclipse': require('./eclipse'),
    'machineout': require('./machineout'),
    'tap': tap,
    'nested': require('./nested'),
    'verbose' : require('./verbose'),
    'lcov' : require('./lcov')
    // browser test reporter is not listed because it cannot be used
    // with the command line tool, only inside a browser.
};
