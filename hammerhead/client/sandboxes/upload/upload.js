HammerheadClient.define('DOMSandbox.Upload', function (require, exports) {
    var EventSandbox = require('DOMSandbox.Event'),
        SharedConst  = require('Shared.Const'),
        Util         = require('Util');

    var eventEmitter = new Util.EventEmitter();

    exports.FILE_UPLOADING_EVENT = 'fileUploading';

    exports.on  = eventEmitter.on.bind(eventEmitter);
    exports.off = eventEmitter.off.bind(eventEmitter);

    function riseChangeEvent (input) {
        EventSandbox.Simulator.change(input);
    }

    function getCurrentInfoManager (input) {
        var contextWindow = input[SharedConst.DOM_SANDBOX_PROCESSED_CONTEXT];

        return contextWindow.Hammerhead._UploadManager;
    }

    exports.init = function (window) {
        EventSandbox.addInternalEventListener(window, ['change'], function (e, dispatched) {
            var input              = e.target || e.srcElement,
                currentInfoManager = getCurrentInfoManager(input);

            if (Util.isFileInput(input) && !dispatched) {
                Util.stopPropagation(e);
                Util.preventDefault(e);

                if (!!input.value || !!currentInfoManager.getValue(input)) {
                    var fileNames = currentInfoManager.getFileNames(input.files, input.value);

                    eventEmitter.emit(exports.FILE_UPLOADING_EVENT, fileNames, input, function (complete) {
                        currentInfoManager.loadFileListData(input, input.files, function (fileList) {
                            currentInfoManager.setUploadInfo(input, fileList, input.value);
                            currentInfoManager.sendFilesInfoToServer(fileList, fileNames, function (errs) {
                                riseChangeEvent(input);
                                complete(errs);
                            });
                        });
                    });
                }
            }
        });
    };

    exports.getFiles = function (input) {
        return input.files !== void 0 ? getCurrentInfoManager(input).getFiles(input) : void 0;
    };

    exports.getUploadElementValue = function (input) {
        return getCurrentInfoManager(input).getValue(input);
    };

    exports.setUploadElementValue = function (input, value) {
        if (value === '') {
            if (getCurrentInfoManager(input).clearUploadInfo(input) && Util.isIE && Util.browserVersion === 11)
                riseChangeEvent(input);
        }

        return value;
    };

    exports.upload = function (input, filePaths, callback) {
        var currentInfoManager = getCurrentInfoManager(input);

        filePaths = filePaths || [];

        currentInfoManager.loadFilesInfoFromServer(filePaths, function (filesInfo) {
            currentInfoManager.prepareFileListWrapper(filesInfo, function (errs, fileList) {
                if (!errs.length) {
                    var value = currentInfoManager.formatValue(filePaths);

                    currentInfoManager.setUploadInfo(input, fileList, value);
                    riseChangeEvent(input);
                }

                callback(errs);
            });
        });
    };
});
