(function () {
    return (function () {
        var _window$location = __get$(window, "location"),
            hostname         = _window$location.hostname,
            port             = _window$location.port;
        return hostname + ':' + port;
    });
})();
