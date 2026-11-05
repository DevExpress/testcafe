const fs            = require('fs');
const Promise       = require('pinkie-promise');
const callsite      = require('callsite');
const stackParser   = require('error-stack-parser');
const padStart      = require('lodash').padStart;
const defaults      = require('lodash').defaults;
const highlight     = require('highlight-es');

const renderers = {
    default: require('./renderers/default'),
    noColor: require('./renderers/no-color'),
    html:    require('./renderers/html'),
};


const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

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
        // Preserve the upstream diagnostic for unsupported V8 frame types.
        // eslint-disable-next-line no-console
        console.log(err);
        return null;
    }
}

function findClosestNonNativeAncestorFrameIdx (stackFrames, curIdx) {
    for (let i = curIdx + 1; i < stackFrames.length; i++) {
        if (!stackFrames[i].isNative() && stackFrames[i].getFileName())
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
    const typeName   = frame.getTypeName();
    const methodName = frame.getMethodName();

    if (funcName) {
        let name                       = '';
        const funcNameStartsWithTypeName = typeName && funcName.indexOf(typeName) === 0;
        const expectedEndMethodIndex     = methodName && funcName.length - methodName.length - 1;
        const actualMethodIndex          = funcName.indexOf('.' + methodName);
        const funcNameEndsWithMethodName = actualMethodIndex >= 0 && expectedEndMethodIndex >= 0 &&
                                         actualMethodIndex === expectedEndMethodIndex;

        if (!funcNameStartsWithTypeName)
            name = typeName + '.';

        name += funcName;

        if (!funcNameEndsWithMethodName)
            name += ' [as ' + methodName + ']';

        return name;
    }

    return typeName + '.' + (methodName || '<anonymous>');
}

function processFrames (stackFrames, processFn) {
    return processFn ? stackFrames.map(processFn) : stackFrames;
}

function getFilePath (filename) {
    if (filename.startsWith('file:'))
        return new URL(filename);

    return filename;
}

function getFrameNames (frame) {
    return {
        functionName: frame.getFunctionName(),
        methodName:   frame.getMethodName(),
        typeName:     getFrameTypeName(frame),
    };
}

// CallsiteRecord
const CallsiteRecord = function (filename, lineNum, callsiteFrameIdx, stackFrames) {
    this.filename         = filename;
    this.lineNum          = lineNum;
    this.callsiteFrameIdx = callsiteFrameIdx;
    this.stackFrames      = stackFrames;
    this.isV8Frames       = isV8StackFrame(this.stackFrames[0]);
};

CallsiteRecord.prototype._getFrameName = function (frame) {
    // NOTE: Code was partially adopted from the V8 code
    // (see: https://github.com/v8/v8/blob/3c3d7e7be80f45eeea0dc74a71d7552e2afc2985/src/js/messages.js#L647)
    let funcName = frame.getFunctionName();

    if (!this.isV8Frames)
        return funcName || '<anonymous>';

    const isCtor   = frame.isConstructor();
    const isMethod = !frame.isToplevel() && !isCtor;

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

    let location = frame.getFileName();
    const lineNum  = frame.getLineNumber();
    const colNum   = frame.getColumnNumber();

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
    const lines            = fileContent.split(NEWLINE);
    const startLineIdx     = Math.max(0, this.lineNum - frameSize);
    const endLineIdx       = Math.min(lines.length - 1, this.lineNum + frameSize);
    let maxLineNumDigits = 0;
    const frameLines       = [];

    for (let i = startLineIdx; i <= endLineIdx; i++) {
        const num = String(i + 1);

        maxLineNumDigits = Math.max(maxLineNumDigits, num.length);

        frameLines.push({
            num:  num,
            src:  lines[i],
            base: i === this.lineNum,
        });
    }

    frameLines.forEach(line => {
        line.num = padStart(line.num, maxLineNumDigits);
    });

    return frameLines;
};

CallsiteRecord.prototype._renderCodeFrame = function (fileContent, renderer, frameSize) {
    if (renderer.syntax)
        fileContent = highlight(fileContent, renderer.syntax);

    const lines   = this._getCodeFrameLines(fileContent, frameSize);
    const lastIdx = lines.length - 1;

    const frame = lines
        .reduce((sourceFrame, line, idx) => {
            const isLast = idx === lastIdx;

            return sourceFrame + renderer.codeLine(line.num, line.base, line.src, isLast);
        }, '');

    return renderer.codeFrame(frame);
};


CallsiteRecord.prototype._renderStack = function (renderer, stackFilter) {
    const record  = this;
    let entries = this.stackFrames.slice(this.callsiteFrameIdx);

    if (stackFilter) {
        entries = entries.filter((frame, idx) => {
            return stackFilter(frame, idx, record.isV8Frames);
        });
    }

    const lastIdx = entries.length - 1;

    const rendered = entries.reduce((str, frame, idx) => {
        const isLast   = idx === lastIdx;
        const name     = record._getFrameName(frame);
        const location = record._getFrameLocation(frame);

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
        stackFilter: null,
    }, opts);

    const codeFrame = opts.codeFrame ? this._renderCodeFrame(fileContent, opts.renderer, opts.frameSize) : '';
    const stack     = opts.stack ? this._renderStack(opts.renderer, opts.stackFilter) : '';

    return codeFrame + stack;
};

CallsiteRecord.prototype.renderSync = function (opts) {
    const filePath    = getFilePath(this.filename);
    const fileContent = fs. readFileSync(filePath).toString();

    return this._renderRecord(fileContent, opts);
};

CallsiteRecord.prototype.render = function (opts) {
    const record = this;

    return new Promise((resolve, reject) => {
        const filePath = getFilePath(record.filename);

        fs.readFile(filePath, (err, fileContent) => {
            if (err)
                reject(err);
            else
                resolve(record._renderRecord(fileContent.toString(), opts));
        });
    });
};

// Static
CallsiteRecord.fromStackFrames = function (stackFrames, fnName, typeName, processFrameFn) {
    if (typeName && fnName === 'constructor')
        fnName = typeName;

    for (let i = 0; i < stackFrames.length; i++) {
        const frameNames    = getFrameNames(stackFrames[i]);
        const fnNameMatch   = frameNames.functionName === fnName || frameNames.methodName === fnName;
        const typeNameMatch = !typeName ||
            frameNames.typeName === typeName ||
            // NOTE: frameNames.typeName === null on Node 16+ when calling a class constructor
            fnNameMatch && frameNames.typeName === null && fnName === typeName;

        if (fnNameMatch && typeNameMatch) {
            const callsiteFrameIdx = findClosestNonNativeAncestorFrameIdx(stackFrames, i);

            if (callsiteFrameIdx !== null) {
                stackFrames = processFrames(stackFrames, processFrameFn);

                const callsiteFrame = stackFrames[callsiteFrameIdx];
                const filename      = callsiteFrame.getFileName();
                const lineNum       = callsiteFrame.getLineNumber() - 1;

                return new CallsiteRecord(filename, lineNum, callsiteFrameIdx, stackFrames);
            }

            return null;
        }
    }

    return null;
};

CallsiteRecord.fromError = function (error, isCallsiteFrame, processFrameFn) {
    let stackFrames = parseStack(error);

    if (stackFrames) {
        if (typeof isCallsiteFrame === 'function') {
            while (stackFrames.length) {
                if (isCallsiteFrame(stackFrames[0]))
                    break;

                stackFrames.shift();
            }
        }

        if (stackFrames.length) {
            stackFrames = processFrames(stackFrames, processFrameFn);

            const filename = stackFrames[0].getFileName();
            const lineNum  = stackFrames[0].getLineNumber() - 1;

            return filename && !isNaN(lineNum) ? new CallsiteRecord(filename, lineNum, 0, stackFrames) : null;
        }
    }

    return null;
};

// API
module.exports = function createCallsiteRecord (options) { /*{ forError, isCallsiteFrame, byFunctionName, typeName, processFrameFn }*/
    if (options.forError)
        return CallsiteRecord.fromError(options.forError, options.isCallsiteFrame, options.processFrameFn);

    else if (options.byFunctionName) {
        const stackFrames = callsite();

        // NOTE: remove API call
        stackFrames.shift();

        return CallsiteRecord.fromStackFrames(stackFrames, options.byFunctionName, options.typeName, options.processFrameFn);
    }

    return null;
};

module.exports.renderers = renderers;
