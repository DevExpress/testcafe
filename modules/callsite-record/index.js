var fs          = require('fs');
var Promise     = require('pinkie-promise');
var callsite    = require('callsite');
var stackParser = require('error-stack-parser');
var padStart    = require('lodash').padStart;
var defaults    = require('lodash').defaults;
var highlight   = require('highlight-es');

var renderers = {
    default: require('./renderers/default'),
    noColor: require('./renderers/no-color'),
    html:    require('./renderers/html')
};


var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

// Utils
function parseStack (error) {
    try {
        return stackParser.parse(error);
    }
    catch (err) {
        return null;
    }
}

function getFrameTypeName (frame) {
    // NOTE: this throws in node 10 for non-methods
    try {
        return frame.getTypeName();
    }
    catch (err) {
        return null;
    }
}

function findClosestNonNativeAncestorFrameIdx (stackFrames, curIdx) {
    for (var i = curIdx + 1; i < stackFrames.length; i++) {
        if (!stackFrames[i].isNative())
            return i;
    }

    return null;
}

function isV8StackFrame (frame) {
    return /CallSite/.test(frame.constructor);
}

function getFrameMethodName (frame, funcName) {
    // NOTE: Code was partially adopted from the V8 code
    // (see: https://github.com/v8/v8/blob/3c3d7e7be80f45eeea0dc74a71d7552e2afc2985/src/js/messages.js#L647)
    var typeName   = frame.getTypeName();
    var methodName = frame.getMethodName();

    if (funcName) {
        var name                       = '';
        var funcNameStartsWithTypeName = typeName && funcName.indexOf(typeName) === 0;
        var funcNameEndsWithMethodName = methodName &&
                                         funcName.indexOf('.' + methodName) === funcName.length - methodName.length - 1;

        if (!funcNameStartsWithTypeName)
            name = typeName + '.';

        name += funcName;

        if (!funcNameEndsWithMethodName)
            name += ' [as ' + methodName + ']';

        return name;
    }

    return typeName + '.' + (methodName || '<anonymous>');
}


// CallsiteRecord
var CallsiteRecord = function (filename, lineNum, callsiteFrameIdx, stackFrames) {
    this.filename         = filename;
    this.lineNum          = lineNum;
    this.callsiteFrameIdx = callsiteFrameIdx;
    this.stackFrames      = stackFrames;
    this.isV8Frames       = isV8StackFrame(this.stackFrames[0]);
};

CallsiteRecord.prototype._getFrameName = function (frame) {
    // NOTE: Code was partially adopted from the V8 code
    // (see: https://github.com/v8/v8/blob/3c3d7e7be80f45eeea0dc74a71d7552e2afc2985/src/js/messages.js#L647)
    var funcName = frame.getFunctionName();

    if (!this.isV8Frames)
        return funcName || '<anonymous>';

    var isCtor   = frame.isConstructor();
    var isMethod = !frame.isToplevel() && !isCtor;

    if (isMethod)
        return getFrameMethodName(frame, funcName);

    funcName = funcName || '<anonymous>';

    return isCtor ? 'new ' + funcName : funcName;
};

CallsiteRecord.prototype._getFrameLocation = function (frame) {
    // NOTE: Code was partially adopted from the V8 code
    // (see: https://github.com/v8/v8/blob/3c3d7e7be80f45eeea0dc74a71d7552e2afc2985/src/js/messages.js#L647)
    if (this.isV8Frames && frame.isNative())
        return 'native';

    var location = frame.getFileName();
    var lineNum  = frame.getLineNumber();
    var colNum   = frame.getColumnNumber();

    if (this.isV8Frames && !location) {
        location = frame.isEval() ? frame.getEvalOrigin() + ', ' : '';
        location += '<anonymous>';
    }

    if (lineNum) {
        location += ':' + lineNum;

        if (colNum)
            location += ':' + colNum;
    }

    return location;
};

CallsiteRecord.prototype._getCodeFrameLines = function (fileContent, frameSize) {
    var lines            = fileContent.split(NEWLINE);
    var startLineIdx     = Math.max(0, this.lineNum - frameSize);
    var endLineIdx       = Math.min(lines.length - 1, this.lineNum + frameSize);
    var maxLineNumDigits = 0;
    var frameLines       = [];

    for (var i = startLineIdx; i <= endLineIdx; i++) {
        var num = String(i + 1);

        maxLineNumDigits = Math.max(maxLineNumDigits, num.length);

        frameLines.push({
            num:  num,
            src:  lines[i],
            base: i === this.lineNum
        });
    }

    frameLines.forEach(function (line) {
        line.num = padStart(line.num, maxLineNumDigits);
    });

    return frameLines;
};

CallsiteRecord.prototype._renderCodeFrame = function (fileContent, renderer, frameSize) {
    if (renderer.syntax)
        fileContent = highlight(fileContent, renderer.syntax);

    var lines   = this._getCodeFrameLines(fileContent, frameSize);
    var lastIdx = lines.length - 1;

    var frame = lines
        .reduce(function (sourceFrame, line, idx) {
            var isLast = idx === lastIdx;

            return sourceFrame + renderer.codeLine(line.num, line.base, line.src, isLast);
        }, '');

    return renderer.codeFrame(frame);
};


CallsiteRecord.prototype._renderStack = function (renderer, stackFilter) {
    var record  = this;
    var entries = this.stackFrames.slice(this.callsiteFrameIdx);

    if (stackFilter) {
        entries = entries.filter(function (frame, idx) {
            return stackFilter(frame, idx, record.isV8Frames);
        });
    }

    var lastIdx = entries.length - 1;

    var rendered = entries.reduce(function (str, frame, idx) {
        var isLast   = idx === lastIdx;
        var name     = record._getFrameName(frame);
        var location = record._getFrameLocation(frame);

        return str + renderer.stackLine(name, location, isLast);
    }, '');

    return rendered ? renderer.stack(rendered) : '';
};

CallsiteRecord.prototype._renderRecord = function (fileContent, opts) {
    opts = defaults({}, opts, {
        renderer:    renderers.default,
        frameSize:   5,
        stack:       true,
        codeFrame:   true,
        stackFilter: null
    }, opts);

    var codeFrame = opts.codeFrame ? this._renderCodeFrame(fileContent, opts.renderer, opts.frameSize) : '';
    var stack     = opts.stack ? this._renderStack(opts.renderer, opts.stackFilter) : '';

    return codeFrame + stack;
};

CallsiteRecord.prototype.renderSync = function (opts) {
    var fileContent = fs.readFileSync(this.filename).toString();

    return this._renderRecord(fileContent, opts);
};

CallsiteRecord.prototype.render = function (opts) {
    var record = this;

    return new Promise(function (resolve, reject) {
        fs.readFile(record.filename, function (err, fileContent) {
            if (err)
                reject(err);
            else
                resolve(record._renderRecord(fileContent.toString(), opts));
        });
    });
};

// Static
CallsiteRecord.fromStackFrames = function (stackFrames, fnName, typeName) {
    if (typeName && fnName === 'constructor')
        fnName = typeName;

    for (var i = 0; i < stackFrames.length; i++) {
        var frame         = stackFrames[i];
        var fnNameMatch   = frame.getFunctionName() === fnName || frame.getMethodName() === fnName;
        var typeNameMatch = !typeName || getFrameTypeName(frame) === typeName;

        if (fnNameMatch && typeNameMatch) {
            var callsiteFrameIdx = findClosestNonNativeAncestorFrameIdx(stackFrames, i);

            if (callsiteFrameIdx !== null) {
                var callsiteFrame = stackFrames[callsiteFrameIdx];
                var filename      = callsiteFrame.getFileName();
                var lineNum       = callsiteFrame.getLineNumber() - 1;

                return new CallsiteRecord(filename, lineNum, callsiteFrameIdx, stackFrames);
            }

            return null;
        }
    }

    return null;
};

CallsiteRecord.fromError = function (error, isCallsiteFrame) {
    var stackFrames = parseStack(error);

    if (stackFrames) {
        if (typeof isCallsiteFrame === 'function') {
            while (stackFrames.length) {
                if (isCallsiteFrame(stackFrames[0]))
                    break;

                stackFrames.shift();
            }
        }

        if (stackFrames.length) {
            var filename = stackFrames[0].getFileName();
            var lineNum  = stackFrames[0].getLineNumber() - 1;

            return filename && !isNaN(lineNum) ? new CallsiteRecord(filename, lineNum, 0, stackFrames) : null;
        }
    }

    return null;
};

// API
module.exports = function createCallsiteRecord (options) { /*{ forError, isCallsiteFrame, byFunctionName, typeName, processFrameFn }*/
    if (options.forError)
        return CallsiteRecord.fromError(options.forError, options.isCallsiteFrame);

    else if (options.byFunctionName) {
        var stackFrames = callsite();

        if (options.processFrameFn) {
            stackFrames = stackFrames.map(function (frame) {
                return options.processFrameFn(frame);
            });
        }

        // NOTE: remove API call
        stackFrames.shift();

        return CallsiteRecord.fromStackFrames(stackFrames, options.byFunctionName, options.typeName);
    }

    return null;
};

module.exports.renderers = renderers;
