'use strict';

var _inherits = require('babel-runtime/helpers/inherits').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _regeneratorRuntime = require('babel-runtime/regenerator').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _httpUtils = require('./http-utils');

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _pipelineContext = require('./pipeline-context');

var _pipelineContext2 = _interopRequireDefault(_pipelineContext);

// Const
var CLIENT_SCRIPT_FILE_PATH = _path2.default.join(__dirname, '../../_compiled_/hammerhead_client/hammerhead.js');
var CLIENT_SCRIPT = _fs2.default.readFileSync(CLIENT_SCRIPT_FILE_PATH).toString();

// Static
function parseServiceMsg(body) {
    body = body.toString();

    try {
        return JSON.parse(body);
    } catch (err) {
        return null;
    }
}

// Proxy

var Proxy = (function (_Router) {
    function Proxy(hostname, port1, port2) {
        var _this = this;

        _classCallCheck(this, Proxy);

        _Router.call(this);

        this.openSessions = {};

        var server1Info = {
            hostname: hostname,
            port: port1,
            crossDomainPort: port2
        };

        var server2Info = {
            hostname: hostname,
            port: port2,
            crossDomainPort: port1
        };

        this.server1 = _http2.default.createServer(function (req, res) {
            return _this._onRequest(req, res, server1Info);
        });
        this.server2 = _http2.default.createServer(function (req, res) {
            return _this._onRequest(req, res, server2Info);
        });

        this.server1.listen(port1);
        this.server2.listen(port2);
    }

    _inherits(Proxy, _Router);

    Proxy.prototype._registerServiceRoutes = function _registerServiceRoutes() {
        var _this2 = this;

        this.GET('/hammerhead.js', {
            contentType: 'application/x-javascript',
            content: CLIENT_SCRIPT
        });

        this.POST('/messaging', function (req, res) {
            return _this2._onServiceMessage(req, res);
        });
    };

    Proxy.prototype._onServiceMessage = function _onServiceMessage(req, res) {
        var body, msg, session, result;
        return _regeneratorRuntime.async(function _onServiceMessage$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return (0, _httpUtils.fetchBody)(req);

                case 2:
                    body = context$2$0.sent;
                    msg = parseServiceMsg(body);
                    session = msg && this.openSession[msg.jobUid];

                    if (!session) {
                        context$2$0.next = 18;
                        break;
                    }

                    context$2$0.prev = 6;
                    context$2$0.next = 9;
                    return session.handleServiceMessage(msg);

                case 9:
                    result = context$2$0.sent;

                    (0, _httpUtils.respondWithJSON)(res, result);
                    context$2$0.next = 16;
                    break;

                case 13:
                    context$2$0.prev = 13;
                    context$2$0.t0 = context$2$0['catch'](6);

                    (0, _httpUtils.respond500)(res, context$2$0.t0);

                case 16:
                    context$2$0.next = 19;
                    break;

                case 18:
                    (0, _httpUtils.respond500)(res);

                case 19:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[6, 13]]);
    };

    Proxy.prototype._onRequest = function _onRequest(req, res, serverInfo) {
        //NOTE: skip browsers favicon requests which we can't process
        if (req.url === '/favicon.ico') (0, _httpUtils.respond404)(res);else if (!this._route(req, res)) {
            // NOTE: not a service request, execute proxy pipeline
            var ctx = new _pipelineContext2.default(req, res, serverInfo);

            //TODO implement public dispatch
            if (ctx.dispatch(this.openSessions)) {} else (0, _httpUtils.respond404)(res);
        }
    };

    // API

    Proxy.prototype.close = function close() {
        this.server1.close();
        this.server2.close();
    };

    Proxy.prototype.openSession = function openSession(session) {
        session.proxy = this;
        this.openSessions[session.id] = session;
    };

    Proxy.prototype.closeSession = function closeSession(session) {
        session.proxy = null;
        delete this.openSessions[session.id];
    };

    return Proxy;
})(_router2.default);

exports.default = Proxy;
module.exports = exports.default;

// TODO call pipeline
//# sourceMappingURL=_proxy.js.map