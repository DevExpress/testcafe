'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _builtIn = require('./built-in');

var _builtIn2 = _interopRequireDefault(_builtIn);

var _pluginHost = require('./plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

var _parseProviderName = require('./parse-provider-name');

var _parseProviderName2 = _interopRequireDefault(_parseProviderName);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _connection = require('../connection');

var _connection2 = _interopRequireDefault(_connection);

var _runtime = require('../../errors/runtime');

var _message = require('../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BROWSER_PROVIDER_RE = /^([^:\s]+):?(.*)?$/;

exports.default = {
    providersCache: {},

    _handlePathAndCmd: function _handlePathAndCmd(alias) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var browserName, providerName, provider;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            browserName = (0, _stringify2.default)(alias);
                            providerName = 'path';
                            _context.next = 4;
                            return _this.getProvider(providerName);

                        case 4:
                            provider = _context.sent;
                            return _context.abrupt('return', { provider: provider, providerName: providerName, browserName: browserName });

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },
    _parseAliasString: function _parseAliasString(alias) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var providerRegExpMatch, providerName, browserName, provider;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            providerRegExpMatch = BROWSER_PROVIDER_RE.exec(alias);

                            if (providerRegExpMatch) {
                                _context2.next = 3;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.cantFindBrowser, alias);

                        case 3:
                            providerName = providerRegExpMatch[1];
                            browserName = providerRegExpMatch[2] || '';
                            _context2.next = 7;
                            return _this2.getProvider(providerName);

                        case 7:
                            provider = _context2.sent;

                            if (!(!provider && providerRegExpMatch[2])) {
                                _context2.next = 12;
                                break;
                            }

                            _context2.next = 11;
                            return _this2.getProvider(providerName + ':');

                        case 11:
                            provider = _context2.sent;

                        case 12:
                            if (provider) {
                                _context2.next = 18;
                                break;
                            }

                            providerName = 'locally-installed';
                            _context2.next = 16;
                            return _this2.getProvider(providerName);

                        case 16:
                            provider = _context2.sent;

                            browserName = providerRegExpMatch[1] || '';

                        case 18:
                            return _context2.abrupt('return', { provider: provider, providerName: providerName, browserName: browserName });

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },
    _parseAlias: function _parseAlias(alias) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(alias && alias.path)) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', _this3._handlePathAndCmd(alias));

                        case 2:
                            if (!(typeof alias === 'string')) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', _this3._parseAliasString(alias));

                        case 4:
                            throw new _runtime.GeneralError(_message2.default.cantFindBrowser, alias);

                        case 5:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },
    _getInfoForAllBrowserNames: function _getInfoForAllBrowserNames(provider, providerName) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var allBrowserNames;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!provider.isMultiBrowser) {
                                _context4.next = 6;
                                break;
                            }

                            _context4.next = 3;
                            return provider.getBrowserList();

                        case 3:
                            _context4.t0 = _context4.sent;
                            _context4.next = 7;
                            break;

                        case 6:
                            _context4.t0 = [];

                        case 7:
                            allBrowserNames = _context4.t0;

                            if (allBrowserNames.length) {
                                _context4.next = 10;
                                break;
                            }

                            return _context4.abrupt('return', { provider: provider, providerName: providerName, browserName: '' });

                        case 10:
                            return _context4.abrupt('return', allBrowserNames.map(function (browserName) {
                                return { provider: provider, providerName: providerName, browserName: browserName };
                            }));

                        case 11:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    },
    _getProviderModule: function _getProviderModule(providerName, moduleName) {
        try {
            var providerObject = require(moduleName);

            this.addProvider(providerName, providerObject);
            return this._getProviderFromCache(providerName);
        } catch (e) {
            return null;
        }
    },
    _getProviderFromCache: function _getProviderFromCache(providerName) {
        return this.providersCache[providerName] || null;
    },
    _getBuiltinProvider: function _getBuiltinProvider(providerName) {
        var providerObject = _builtIn2.default[providerName];

        if (!providerObject) return null;

        this.addProvider(providerName, providerObject);

        return this._getProviderFromCache(providerName);
    },
    getBrowserInfo: function getBrowserInfo(alias) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var browserInfo, provider, providerName, browserName;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            if (!(alias instanceof _connection2.default)) {
                                _context5.next = 2;
                                break;
                            }

                            return _context5.abrupt('return', alias);

                        case 2:
                            _context5.next = 4;
                            return _this5._parseAlias(alias);

                        case 4:
                            browserInfo = _context5.sent;
                            provider = browserInfo.provider, providerName = browserInfo.providerName, browserName = browserInfo.browserName;

                            if (!(browserName === 'all')) {
                                _context5.next = 10;
                                break;
                            }

                            _context5.next = 9;
                            return _this5._getInfoForAllBrowserNames(provider, providerName);

                        case 9:
                            return _context5.abrupt('return', _context5.sent);

                        case 10:
                            _context5.next = 12;
                            return provider.isValidBrowserName(browserName);

                        case 12:
                            if (_context5.sent) {
                                _context5.next = 14;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.cantFindBrowser, alias);

                        case 14:
                            return _context5.abrupt('return', browserInfo);

                        case 15:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this5);
        }))();
    },
    addProvider: function addProvider(providerName, providerObject) {
        providerName = (0, _parseProviderName2.default)(providerName).providerName;

        this.providersCache[providerName] = new _2.default(new _pluginHost2.default(providerObject, providerName));
    },
    removeProvider: function removeProvider(providerName) {
        providerName = (0, _parseProviderName2.default)(providerName).providerName;

        delete this.providersCache[providerName];
    },
    getProvider: function getProvider(providerName) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var parsedProviderName, moduleName, provider;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            parsedProviderName = (0, _parseProviderName2.default)(providerName);
                            moduleName = parsedProviderName.moduleName;


                            providerName = parsedProviderName.providerName;

                            provider = _this6._getProviderFromCache(providerName) || _this6._getProviderModule(providerName, moduleName) || _this6._getBuiltinProvider(providerName);

                            if (!provider) {
                                _context6.next = 7;
                                break;
                            }

                            _context6.next = 7;
                            return _this6.providersCache[providerName].init();

                        case 7:
                            return _context6.abrupt('return', provider);

                        case 8:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this6);
        }))();
    },
    dispose: function dispose() {
        return _pinkie2.default.all((0, _values2.default)(this.providersCache).map(function (item) {
            return item.dispose();
        }));
    }
};
module.exports = exports['default'];