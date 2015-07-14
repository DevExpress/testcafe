(function () {
    var Errors = typeof module !== 'undefined' && module.exports ? exports : HammerheadClient;

    Errors.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED = 'CLIENT_URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED';

    Errors.hasErrorStepName = function(err){
      return err.code !== Errors.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED;
    };

    if (typeof module !== 'undefined' && module.exports)
        module.exports = Errors;
    else {
        HammerheadClient.define('Shared.Errors', function () {
            this.exports = Errors;
        });
    }
})();