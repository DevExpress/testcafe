var sharedConst = require('./../shared/const');

exports.processFormData = function (contentTypeHeader, body) {
    var formData = new FormData();

    formData.parseContentTypeHeader(contentTypeHeader);

    if (formData.boundary && formData.boundary.length) {
        formData.parse(body);
        formData.process(sharedConst.UPLOAD_SANDBOX_HIDDEN_INPUT_NAME);

        return formData.toBuffer();
    }

    return null;
};

exports.getFileInfo = function (contentTypeHeader, body, inputName, fileName) {
    var form = new FormData();

    form.parseContentTypeHeader(contentTypeHeader);
    form.parse(body);

    var param    = form._getParamsByName(inputName, false)[0];
    var fileBody = Buffer.concat(param.body);
    fileName     = fileName.substr(fileName.lastIndexOf('\\') + 1);

    return {
        data: fileBody.toString('base64'),
        info: {
            type: param.headers['Content-Type'],
            name: fileName,
            size: fileBody.length
        }
    };
};

// FormData
function FormData () {
    this.boundary    = null;
    this.boundaryEnd = null;
    this.epilogue    = [];
    this.params      = [];
    this.preamble    = [];
}

exports.FormData = FormData;

FormData.prototype._addEpilogueLine = function (line) {
    if (this.epilogue.length)
        this.epilogue.push(new Buffer('\r\n'));

    this.epilogue.push(line);
};

FormData.prototype._addParam = function (param) {
    this.params.push(param);

    return param;
};

FormData.prototype._addPreambleLine = function (line) {
    if (this.preamble.length)
        this.preamble.push(new Buffer('\r\n'));

    this.preamble.push(line);
};

FormData.prototype._getParamsByName = function (name, cut) {
    var result = [];

    for (var i = 0; i < this.params.length; i++) {
        if (this.params[i].name === name) {
            var param = cut ? this.params.splice(i--, 1)[0] : this.params[i];

            result.push(param);
        }
    }

    return result;
};

FormData.prototype._processFileInfo = function (fileInfo) {
    var params = this._getParamsByName(fileInfo.name);

    while (params.length < fileInfo.files.length)
        params.push(this._addParam(new FormDataParam()));

    params.forEach(function (param, index) {
        param.addFileInfo(fileInfo, index);
    });
};


FormData.prototype.parse = function (formDataBuff) {
    var lineReader     = createLineReader(formDataBuff),
        currentParam   = null,
        isReadPreamble = true,
        isReadHeaders  = false,
        isReadEpilog   = false,
        formData       = this;

    var isBoundary = function (lineBuff) {
        return equalBuff(formData.boundary, lineBuff);
    };

    var isBoundaryEnd = function (lineBuff) {
        return equalBuff(formData.boundaryEnd, lineBuff);
    };

    lineReader.forEach(function (line) {
        if (isBoundary(line)) {
            if (currentParam)
                formData.params.push(currentParam);

            currentParam   = new FormDataParam();
            isReadPreamble = false;
            isReadHeaders  = true;
        }
        else if (isBoundaryEnd(line)) {
            if (currentParam)
                formData.params.push(currentParam);

            isReadPreamble = false;
            isReadHeaders  = false;
            isReadEpilog   = true;
        }
        else if (isReadPreamble) {
            formData._addPreambleLine(line);
        }
        else if (isReadHeaders) {
            if (line.length)
                currentParam.setHeader(line.toString());
            else
                isReadHeaders = false;
        }
        else if (isReadEpilog) {
            formData._addEpilogueLine(line);
        }
        else
            currentParam.pushBodyLine(line);
    });
};

FormData.prototype.parseContentTypeHeader = function (contentTypeHeader) {
    var isFormData = (contentTypeHeader + '').indexOf('multipart/form-data') !== -1,
        execResult = null;

    console.log('isFormData ', isFormData);
    if (isFormData) {
        execResult = /;\s*boundary=([^;]*)/i.exec(contentTypeHeader);

        console.log('execResult ', execResult[1]);
        if (execResult && execResult[1]) {
            this.boundary    = new Buffer('--' + execResult[1]);
            this.boundaryEnd = new Buffer('--' + execResult[1] + '--');
            console.log(JSON.stringify(this.boundary));
            console.log(JSON.stringify(this.boundaryEnd));
        }
    }
};

FormData.prototype.process = function (processParamName) {
    var formData     = this,
        processParam = formData._getParamsByName(processParamName, true)[0],
        processInfo  = processParam ? JSON.parse(Buffer.concat(processParam.body).toString()) : [];

    processInfo.forEach(function (fileInfo) {
        formData._processFileInfo(fileInfo);
    });
};

FormData.prototype.toBuffer = function () {
    var formDataBuffArray = this.preamble;

    if (formDataBuffArray.length)
        formDataBuffArray.push(new Buffer('\r\n'));

    for (var i = 0; i < this.params.length; i++)
        formDataBuffArray.push(this.boundary, new Buffer('\r\n'), this.params[i].toBuffer(), new Buffer('\r\n'));

    formDataBuffArray.push(this.boundaryEnd, new Buffer('\r\n'));

    if (this.epilogue.length)
        formDataBuffArray = formDataBuffArray.concat(this.epilogue);

    return Buffer.concat(formDataBuffArray);
};


// FormDataParam
function FormDataParam () {
    this.body    = [];
    this.headers = {};
    this.name    = null;
}

exports.FormDataParam = FormDataParam;

FormDataParam.prototype._parseContentDisposition = function (contentDisposition) {
    var execResult = /;\s*name="([^"]*)"/i.exec(contentDisposition);

    if (execResult)
        this.name = execResult[1];

    execResult = /;\s*filename="([^"]*)"/i.exec(contentDisposition);

    if (execResult)
        this.fileName = execResult[1];
};

FormDataParam.prototype._setContentDispositionForFile = function (name, fileName) {
    this.name                           = name;
    this.fileName                       = fileName;
    this.headers['Content-Disposition'] = 'form-data; name="' + name + '"; filename="' + fileName + '"';
};


FormDataParam.prototype.addFileInfo = function (fileInfo, fileIndex) {
    this._setContentDispositionForFile(fileInfo.name, fileInfo.files[fileIndex].name);
    this.setHeader('Content-Type', fileInfo.files[fileIndex].type);
    this.body = [new Buffer(fileInfo.files[fileIndex].data, 'base64')];
};

FormDataParam.prototype.isFile = function () {
    return 'fileName' in this;
};

FormDataParam.prototype.pushBodyLine = function (line) {
    if (this.body.length)
        this.body.push(new Buffer('\r\n'));

    this.body.push(line);
};

FormDataParam.prototype.setHeader = function (header, value) {
    var parsedHeader = value ? null : header.split(':'),
        headerName   = parsedHeader ? parsedHeader.shift() : header,
        headerValue  = parsedHeader ? parsedHeader.join(':').replace(/^\s+/, '') : value;

    this.headers[headerName] = headerValue;

    if (headerName === 'Content-Disposition')
        this._parseContentDisposition(headerValue);
};

FormDataParam.prototype.toBuffer = function () {
    var resultBufferArray = [];

    for (var headerName in this.headers) {
        if (this.headers.hasOwnProperty(headerName))
            resultBufferArray.push(new Buffer(headerName + ': ' + this.headers[headerName] + '\r\n'));
    }

    resultBufferArray.push(new Buffer('\r\n'));

    return Buffer.concat(resultBufferArray.concat(this.body));
};

// Util
function createLineReader (buffer) {
    var LINE_FEED_CHAR_CODE       = 10,
        CARRIAGE_RETURN_CHAR_CODE = 13,
        NEWLINE_LENGTH            = 2;

    var start     = 0,
        isNewline = function (buffer, index) {
            return buffer[index] === CARRIAGE_RETURN_CHAR_CODE && buffer[index + 1] === LINE_FEED_CHAR_CODE;
        };

    return {
        next:    function () {
            var line = null;

            for (var index = start; index < buffer.length; index++) {
                if (isNewline(buffer, index) || index === buffer.length - 1) {
                    if (index === buffer.length - 1)
                        index++;

                    line  = buffer.slice(start, index);
                    start = index + NEWLINE_LENGTH;
                    break;
                }
            }

            return line;
        },
        forEach: function (callback) {
            var line = this.next();

            console.log('line ', JSON.stringify(line));

            while (line !== null) {
                callback(line);
                line = this.next();
            }
        }
    };
}

function equalBuff (buf1, buf2) {
    if (buf1.length === buf2.length) {
        for (var i = 0; i < buf1.length; i++) {
            if (buf1[i] !== buf2[i])
                break;
        }

        if (i === buf1.length)
            return true;
    }

    return false;
}
