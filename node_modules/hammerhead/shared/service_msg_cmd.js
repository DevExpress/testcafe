(function () {
    var ServiceCommands = {
        GET_UPLOADED_FILES: 'GET_UPLOADED_FILES',
        SET_COOKIE: 'CMD_SET_COOKIE',
        UPLOAD_FILES: 'UPLOAD_FILES',
        GET_IFRAME_TASK_SCRIPT: 'GET_IFRAME_TASK_SCRIPT'
    };

    if (typeof module !== 'undefined' && module.exports)
        module.exports = ServiceCommands;
    else {
        HammerheadClient.define('Shared.ServiceCommands', function () {
            this.exports = ServiceCommands;
        });
    }
})();