var createCallsiteRecord = require('@devexpress/callsite-record');
var stackTrace           = require('stack-chain');

var record = null;

// NOTE: Limit stack entries to this file
function stackFilter (err, frames) {
    return frames
        .filter(function (frame) {
            var filename = frame.getFileName();

            return filename === __filename || filename === require.resolve('@devexpress/callsite-record');
        });
}

stackTrace.filter.attach(stackFilter);

function func1 () {
    record = createCallsiteRecord({ byFunctionName: 'func1' });
}

(function func2 () {
    func1();
})();

stackTrace.filter.deattach(stackFilter);

module.exports = record;
