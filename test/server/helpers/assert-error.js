var sep         = require('path').sep;
var stripAnsi   = require('strip-ansi');
var expect      = require('chai').expect;
var stackParser = require('error-stack-parser');


function assertStack (err, expected) {
    // HACK: stackParser can't handle empty stacks correctly
    // (it treats error messages as stack frames).
    // Therefore we add this dummy stack frame to make things work
    if (!expected.stackTop)
        err.stack += '\n    at (<empty-marker>:1:1)';

    var parsedStack = stackParser.parse(err);

    if (expected.stackTop) {
        var expectedStackTop = Array.isArray(expected.stackTop) ? expected.stackTop : [expected.stackTop];

        parsedStack.forEach(function (frame, idx) {
            var filename   = frame.fileName;
            var isInternal = frame.fileName.indexOf('internal/') === 0 ||
                             frame.fileName.indexOf(sep) < 0;

            // NOTE: assert that stack is clean from internals
            expect(isInternal).to.be.false;
            expect(filename).not.to.contain(sep + 'babel-');
            expect(filename).not.to.contain(sep + 'babylon' + sep);
            expect(filename).not.to.contain(sep + 'core-js' + sep);

            if (expectedStackTop[idx])
                expect(filename).eql(expectedStackTop[idx]);
        });
    }
    else {
        expect(parsedStack.length).eql(1);
        expect(parsedStack[0].fileName).eql('<empty-marker>');
    }
}

function assertError (err, expected) {
    expect(err.message).eql(expected.message);
    expect(err.stack.indexOf(expected.message)).eql(0);

    assertStack(err, expected);
}

function assertAPIError (err, expected) {
    assertError(err, expected);

    expect(expected.callsite).to.not.empty;
    expect(err.stack.indexOf(expected.message + '\n\n' + expected.callsite)).eql(0);
    expect(stripAnsi(err.coloredStack)).eql(err.stack);
}

// NOTE: chai's throws doesn't perform deep comparison of error objects
function assertThrow (fn, expectedErr) {
    var actualErr = null;

    try {
        fn();
    }
    catch (err) {
        actualErr = err;
    }

    expect(actualErr).eql(expectedErr);
}

module.exports = {
    assertError:    assertError,
    assertAPIError: assertAPIError,
    assertThrow:    assertThrow
};
