HammerheadClient.define('DOMSandbox.Upload.InfoManager', function (require, exports) {
    var $ = require('jQuery'),
        HiddenInfo = require('DOMSandbox.Upload.HiddenInfo'),
        ServiceCommands = require('Shared.ServiceCommands'),
        Transport = require('Transport'),
        Settings = require('Settings'),
        NativeMethods = require('DOMSandbox.NativeMethods'),
        Util = require('Util'),
        SharedConst = require('Shared.Const');

    var FAKE_PATH_STRING = 'C:\\fakepath\\',
        UPLOAD_IFRAME_FOR_IE9_ID = 'uploadIFrameForIE9' + SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX;

    var uploadInfo = [];

    function FileListWrapper(length) {
        this.length = length;
        this.item = function (index) {
            return this[index];
        };
    }

    function base64ToBlob(base64Data, mimeType, sliceSize) {
        mimeType = mimeType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(base64Data),
            byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize),
                byteNumbers = new Array(slice.length);

            for (var i = 0; i < slice.length; i++)
                byteNumbers[i] = slice.charCodeAt(i);

            byteArrays.push(new Uint8Array(byteNumbers));
        }

        return new Blob(byteArrays, {type: mimeType});
    }

    function createFileListWrapper(fileList) {
        var fileListWrapper = new FileListWrapper(fileList.length);

        for (var i = 0; i < fileList.length; i++)
            fileListWrapper[i] = createFileWrapper(fileList[i]);

        return fileListWrapper;
    }

    function createFileWrapper(fileInfo) {
        var wrapper = null;

        if (!window.Blob) {
            wrapper = {
                size: fileInfo.info.size,
                type: fileInfo.info.type
            };
        } else if (fileInfo.blob) {
            wrapper = new Blob([fileInfo.blob], {type: fileInfo.info.type});
        } else
            wrapper = base64ToBlob(fileInfo.data, fileInfo.info.type);

        wrapper.name = fileInfo.info.name;
        wrapper.lastModifiedDate = new Date(fileInfo.info.lastModifiedDate);
        wrapper.base64 = fileInfo.data;

        return wrapper;
    }

    function getFileListData(fileList) {
        var data = [];

        for (var i = 0; i < fileList.length; i++)
            data.push(fileList[i].base64);

        return data;
    }

    function getUploadIFrameForIE9() {
        var uploadIFrame = NativeMethods.querySelector.call(document, '#' + UPLOAD_IFRAME_FOR_IE9_ID);

        if (!uploadIFrame) {
            uploadIFrame = NativeMethods.createElement.call(document, 'iframe');

            NativeMethods.setAttribute.call(uploadIFrame, 'id', UPLOAD_IFRAME_FOR_IE9_ID);
            NativeMethods.setAttribute.call(uploadIFrame, 'name', UPLOAD_IFRAME_FOR_IE9_ID);
            uploadIFrame.style.display = 'none';

            NativeMethods.querySelector.call(document, '#root' + SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX).appendChild(uploadIFrame);
        }

        return uploadIFrame;
    }

    function loadFileListDataForIE9(input, callback) {
        var form = input.form;

        if (form && input.value) {
            var sourceTarget = form.target,
                sourceActionString = form.action,
                sourceMethod = form.method,
                uploadIFrame = getUploadIFrameForIE9();

            uploadIFrame.addEventListener('load', function () {
                var fileListWrapper = new FileListWrapper(1);

                fileListWrapper[0] = createFileWrapper(JSON.parse(uploadIFrame.contentWindow.document.body.innerHTML));
                uploadIFrame.removeEventListener('load', arguments.callee);
                callback(fileListWrapper);
            });

            form.action = Settings.IE9_FILE_READER_SHIM_URL + '?input-name=' + input.name + '&filename=' + input.value;
            form.target = UPLOAD_IFRAME_FOR_IE9_ID;
            form.method = 'post';

            form.submit();

            form.action = sourceActionString;
            form.target = sourceTarget;
            form.method = sourceMethod;
        } else
            callback(new FileListWrapper(0));
    }


    exports.clearUploadInfo = function (input) {
        var inputInfo = exports.getUploadInfo(input);

        if(inputInfo) {
            inputInfo.files = createFileListWrapper([]);
            inputInfo.value = '';

            return HiddenInfo.removeInputInfo(input);
        }
    };

    exports.formatValue = function (fileNames) {
        var value = '';

        fileNames = typeof fileNames === 'string' ? [fileNames] : fileNames;

        if (fileNames && fileNames.length) {
            if ($.browser.webkit) {
                value = FAKE_PATH_STRING + fileNames[0].split('/').pop();
            } else if ($.browser.msie) {
                var filePaths = [];

                for (var i = 0; i < fileNames.length; i++)
                    filePaths.push(FAKE_PATH_STRING + fileNames[i].split('/').pop());

                value = filePaths.join(', ');
            } else
                return fileNames[0].split('/').pop();
        }

        return value;
    };

    exports.getFileNames = function (fileList, value) {
        var result = [];

        if (fileList) {
            for (var i = 0; i < fileList.length; i++)
                result.push(fileList[i].name);
        } else if (value.lastIndexOf('\\') !== -1)
            result.push(value.substr(value.lastIndexOf('\\') + 1));

        return result;
    };

    exports.getFiles = function (input) {
        var inputInfo = exports.getUploadInfo(input);

        return inputInfo ? inputInfo.files : createFileListWrapper([]);
    };

    exports.getUploadInfo = function (input) {
        for (var i = 0; i < uploadInfo.length; i++) {
            if (uploadInfo[i].input === input)
                return uploadInfo[i];
        }

        return null;
    };

    exports.getValue = function (input) {
        var inputInfo = exports.getUploadInfo(input);

        return inputInfo ? inputInfo.value : '';
    };

    exports.loadFileListData = function (input, fileList, callback) {
        if (Util.isIE && Util.browserVersion === 9)
            loadFileListDataForIE9(input, callback);
        else if (!fileList.length)
            callback(new FileListWrapper(0));
        else {
            var index = 0,
                fileReader = new FileReader(),
                file = fileList[index],
                fileListWrapper = new FileListWrapper(fileList.length);

            fileReader.addEventListener('load', function (e) {
                fileListWrapper[index] = createFileWrapper({
                    data: e.target.result.substr(e.target.result.indexOf(',') + 1),
                    blob: file.slice(0, file.size),
                    info: {
                        type: file.type,
                        name: file.name,
                        lastModifiedDate: file.lastModifiedDate
                    }
                });

                if (fileList[++index]) {
                    file = fileList[index];
                    fileReader.readAsDataURL(file);
                } else
                    callback(fileListWrapper);
            });
            fileReader.readAsDataURL(file);
        }
    };

    exports.loadFilesInfoFromServer = function (filePaths, callback) {
        Transport.asyncServiceMsg({
            cmd: ServiceCommands.GET_UPLOADED_FILES,
            filePaths: typeof filePaths === 'string' ? [filePaths] : filePaths
        }, callback);
    };

    exports.prepareFileListWrapper = function (filesInfo, callback) {
        var errs = [],
            validFilesInfo = [];

        for (var i = 0; i < filesInfo.length; i++)
            (filesInfo[i].code ? errs : validFilesInfo).push(filesInfo[i]);

        callback(errs, createFileListWrapper(validFilesInfo));
    };

    exports.setUploadInfo = function (input, fileList, value) {
        var inputInfo = exports.getUploadInfo(input);

        if (!inputInfo) {
            inputInfo = { input: input };
            uploadInfo.push(inputInfo);
        }

        inputInfo.files = fileList;
        inputInfo.value = value;

        HiddenInfo.addInputInfo(input, fileList, value);
    };

    exports.sendFilesInfoToServer = function (fileList, fileNames, callback) {
        Transport.asyncServiceMsg({
            cmd: ServiceCommands.UPLOAD_FILES,
            data: getFileListData(fileList),
            fileNames: fileNames
        }, callback);
    };
});