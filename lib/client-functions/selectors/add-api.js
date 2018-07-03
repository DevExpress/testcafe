'use strict';

exports.__esModule = true;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getSnapshot = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(getSelector, callsite) {
        var node, selector;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        node = null;
                        selector = getSelector();
                        _context.prev = 2;
                        _context.next = 5;
                        return selector();

                    case 5:
                        node = _context.sent;
                        _context.next = 12;
                        break;

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](2);

                        _context.t0.callsite = callsite;
                        throw _context.t0;

                    case 12:
                        if (node) {
                            _context.next = 14;
                            break;
                        }

                        throw new _testRun.CantObtainInfoForElementSpecifiedBySelectorError(callsite);

                    case 14:
                        return _context.abrupt('return', node);

                    case 15:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 8]]);
    }));

    return function getSnapshot(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

exports.addCustomMethods = addCustomMethods;
exports.addAPI = addAPI;

var _lodash = require('lodash');

var _builderSymbol = require('../builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _snapshotProperties = require('./snapshot-properties');

var _testRun = require('../../errors/test-run');

var _getCallsite = require('../../errors/get-callsite');

var _clientFunctionBuilder = require('../client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _reExecutablePromise = require('../../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _makeRegExp = require('../../utils/make-reg-exp');

var _makeRegExp2 = _interopRequireDefault(_makeRegExp);

var _selectorTextFilter = require('./selector-text-filter');

var _selectorTextFilter2 = _interopRequireDefault(_selectorTextFilter);

var _selectorAttributeFilter = require('./selector-attribute-filter');

var _selectorAttributeFilter2 = _interopRequireDefault(_selectorAttributeFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SNAPSHOT_PROPERTIES = _snapshotProperties.NODE_SNAPSHOT_PROPERTIES.concat(_snapshotProperties.ELEMENT_SNAPSHOT_PROPERTIES);

var filterNodes = new _clientFunctionBuilder2.default(function (nodes, filter, querySelectorRoot, originNode) {
    for (var _len = arguments.length, filterArgs = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
        filterArgs[_key - 4] = arguments[_key];
    }

    if (typeof filter === 'number') {
        var matchingNode = filter < 0 ? nodes[nodes.length + filter] : nodes[filter];

        return matchingNode ? [matchingNode] : [];
    }

    var result = [];

    if (typeof filter === 'string') {
        // NOTE: we can search for elements only in document or element.
        if (querySelectorRoot.nodeType !== 1 && querySelectorRoot.nodeType !== 9) return null;

        var matching = querySelectorRoot.querySelectorAll(filter);
        var matchingArr = [];

        for (var i = 0; i < matching.length; i++) {
            matchingArr.push(matching[i]);
        }filter = function filter(node) {
            return matchingArr.indexOf(node) > -1;
        };
    }

    if (typeof filter === 'function') {
        for (var j = 0; j < nodes.length; j++) {
            if (filter.apply(undefined, [nodes[j], j, originNode].concat(filterArgs))) result.push(nodes[j]);
        }
    }

    return result;
}).getFunction();

var expandSelectorResults = new _clientFunctionBuilder2.default(function (selector, populateDerivativeNodes) {
    var nodes = selector();

    if (!nodes.length) return null;

    var result = [];

    for (var i = 0; i < nodes.length; i++) {
        var derivativeNodes = populateDerivativeNodes(nodes[i]);

        if (derivativeNodes) {
            for (var j = 0; j < derivativeNodes.length; j++) {
                if (result.indexOf(derivativeNodes[j]) < 0) result.push(derivativeNodes[j]);
            }
        }
    }

    return result;
}).getFunction();

function assertAddCustomDOMPropertiesOptions(properties) {
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomDOMProperties', '"addCustomDOMProperties" option', properties);

    (0, _keys2.default)(properties).forEach(function (prop) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'addCustomDOMProperties', 'Custom DOM properties method \'' + prop + '\'', properties[prop]);
    });
}

function assertAddCustomMethods(properties, opts) {
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', properties);

    if (opts !== void 0) (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', opts);

    (0, _keys2.default)(properties).forEach(function (prop) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'addCustomMethods', 'Custom method \'' + prop + '\'', properties[prop]);
    });
}

function addSnapshotProperties(obj, getSelector, properties) {
    var _this = this;

    properties.forEach(function (prop) {
        (0, _defineProperty2.default)(obj, prop, {
            get: function get() {
                var callsite = (0, _getCallsite.getCallsiteForMethod)('get');

                return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                    var snapshot;
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    _context2.next = 2;
                                    return getSnapshot(getSelector, callsite);

                                case 2:
                                    snapshot = _context2.sent;
                                    return _context2.abrupt('return', snapshot[prop]);

                                case 4:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this);
                })));
            }
        });
    });
}

function addCustomMethods(obj, getSelector, SelectorBuilder, customMethods) {
    var customMethodProps = customMethods ? (0, _keys2.default)(customMethods) : [];

    customMethodProps.forEach(function (prop) {
        var _customMethods$prop = customMethods[prop],
            _customMethods$prop$r = _customMethods$prop.returnDOMNodes,
            returnDOMNodes = _customMethods$prop$r === undefined ? false : _customMethods$prop$r,
            method = _customMethods$prop.method;


        var dependencies = {
            customMethod: method,
            selector: getSelector()
        };

        var callsiteNames = { instantiation: prop };

        if (returnDOMNodes) {
            obj[prop] = function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                var selectorFn = function selectorFn() {
                    /* eslint-disable no-undef */
                    var nodes = selector();

                    return customMethod.apply(customMethod, [nodes].concat(args));
                    /* eslint-enable no-undef */
                };

                return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, function () {
                    return true;
                }, {
                    args: args,
                    customMethod: method
                });
            };
        } else {
            obj[prop] = new _clientFunctionBuilder2.default(function () {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                /* eslint-disable no-undef */
                var node = selector();

                return customMethod.apply(customMethod, [node].concat(args));
                /* eslint-enable no-undef */
            }, { dependencies: dependencies }, callsiteNames).getFunction();
        }
    });
}

function addSnapshotPropertyShorthands(obj, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    var _this2 = this;

    var properties = SNAPSHOT_PROPERTIES;

    if (customDOMProperties) properties = properties.concat((0, _keys2.default)(customDOMProperties));

    addSnapshotProperties(obj, getSelector, properties);
    addCustomMethods(obj, getSelector, SelectorBuilder, customMethods);

    obj.getStyleProperty = function (prop) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('getStyleProperty');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var snapshot;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return getSnapshot(getSelector, callsite);

                        case 2:
                            snapshot = _context3.sent;
                            return _context3.abrupt('return', snapshot.style ? snapshot.style[prop] : void 0);

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this2);
        })));
    };

    obj.getAttribute = function (attrName) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('getAttribute');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var snapshot;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return getSnapshot(getSelector, callsite);

                        case 2:
                            snapshot = _context4.sent;
                            return _context4.abrupt('return', snapshot.attributes ? snapshot.attributes[attrName] : void 0);

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this2);
        })));
    };

    obj.hasAttribute = function (attrName) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('hasAttribute');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var snapshot;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return getSnapshot(getSelector, callsite);

                        case 2:
                            snapshot = _context5.sent;
                            return _context5.abrupt('return', snapshot.attributes ? snapshot.attributes.hasOwnProperty(attrName) : false);

                        case 4:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this2);
        })));
    };

    obj.getBoundingClientRectProperty = function (prop) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('getBoundingClientRectProperty');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var snapshot;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return getSnapshot(getSelector, callsite);

                        case 2:
                            snapshot = _context6.sent;
                            return _context6.abrupt('return', snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0);

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this2);
        })));
    };

    obj.hasClass = function (name) {
        var callsite = (0, _getCallsite.getCallsiteForMethod)('hasClass');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            var snapshot;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return getSnapshot(getSelector, callsite);

                        case 2:
                            snapshot = _context7.sent;
                            return _context7.abrupt('return', snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false);

                        case 4:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this2);
        })));
    };
}

function createCounter(getSelector, SelectorBuilder) {
    var _this3 = this;

    var builder = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    var counter = builder.getFunction();
    var callsite = (0, _getCallsite.getCallsiteForMethod)('get');

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.prev = 0;
                        _context8.next = 3;
                        return counter();

                    case 3:
                        return _context8.abrupt('return', _context8.sent);

                    case 6:
                        _context8.prev = 6;
                        _context8.t0 = _context8['catch'](0);

                        _context8.t0.callsite = callsite;
                        throw _context8.t0;

                    case 10:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, _this3, [[0, 6]]);
    }));
}

function addCounterProperties(obj, getSelector, SelectorBuilder) {
    var _this4 = this;

    Object.defineProperty(obj, 'count', {
        get: function get() {
            var counter = createCounter(getSelector, SelectorBuilder);

            return _reExecutablePromise2.default.fromFn(function () {
                return counter();
            });
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: function get() {
            var counter = createCounter(getSelector, SelectorBuilder);

            return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return counter();

                            case 2:
                                _context9.t0 = _context9.sent;
                                return _context9.abrupt('return', _context9.t0 > 0);

                            case 4:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, _this4);
            })));
        }
    });
}

function convertFilterToClientFunctionIfNecessary(callsiteName, filter, dependencies) {
    if (typeof filter === 'function') {
        var builder = filter[_builderSymbol2.default];
        var fn = builder ? builder.fn : filter;
        var options = builder ? (0, _lodash.assign)({}, builder.options, { dependencies: dependencies }) : { dependencies: dependencies };

        return new _clientFunctionBuilder2.default(fn, options, { instantiation: callsiteName }).getFunction();
    }

    return filter;
}

function createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, additionalDependencies) {
    var collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });
    var customDOMProperties = collectionModeSelectorBuilder.options.customDOMProperties;
    var customMethods = collectionModeSelectorBuilder.options.customMethods;

    var dependencies = {
        selector: collectionModeSelectorBuilder.getFunction(),
        filter: filter,
        filterNodes: filterNodes
    };

    var _collectionModeSelect = collectionModeSelectorBuilder.options,
        boundTestRun = _collectionModeSelect.boundTestRun,
        timeout = _collectionModeSelect.timeout,
        visibilityCheck = _collectionModeSelect.visibilityCheck;


    dependencies = (0, _lodash.assign)(dependencies, additionalDependencies);

    var builder = new SelectorBuilder(selectorFn, {
        dependencies: dependencies,
        customDOMProperties: customDOMProperties,
        customMethods: customMethods,
        boundTestRun: boundTestRun,
        timeout: timeout,
        visibilityCheck: visibilityCheck
    }, { instantiation: 'Selector' });

    return builder.getFunction();
}

var filterByText = convertFilterToClientFunctionIfNecessary('filter', _selectorTextFilter2.default);
var filterByAttr = convertFilterToClientFunctionIfNecessary('filter', _selectorAttributeFilter2.default);

function ensureRegExpContext(str) {
    // NOTE: if a regexp is created in a separate context (via the 'vm' module) we
    // should wrap it with new RegExp() to make the `instanceof RegExp` check successful.
    if (typeof str !== 'string' && !(str instanceof RegExp)) return new RegExp(str);

    return str;
}

function addFilterMethods(obj, getSelector, SelectorBuilder) {
    obj.nth = function (index) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.number, 'nth', '"index" argument', index);

        var builder = new SelectorBuilder(getSelector(), { index: index }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.withText = function (text) {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withText', '"text" argument', text);

        text = ensureRegExpContext(text);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, textRe);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByText, {
            textRe: (0, _makeRegExp2.default)(text)
        });
    };

    obj.withExactText = function (text) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'withExactText', '"text" argument', text);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, exactText);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByText, {
            exactText: text
        });
    };

    obj.withAttribute = function (attrName, attrValue) {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withAttribute', '"attrName" argument', attrName);

        attrName = ensureRegExpContext(attrName);

        if (attrValue !== void 0) {
            (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withAttribute', '"attrValue" argument', attrValue);
            attrValue = ensureRegExpContext(attrValue);
        }

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, attrName, attrValue);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByAttr, {
            attrName: attrName,
            attrValue: attrValue
        });
    };

    obj.filter = function (filter, dependencies) {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function], 'filter', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('filter', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter);
    };

    obj.filterVisible = function () {
        var builder = new SelectorBuilder(getSelector(), { filterVisible: true }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.filterHidden = function () {
        var builder = new SelectorBuilder(getSelector(), { filterHidden: true }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomDOMPropertiesMethod(obj, getSelector, SelectorBuilder) {
    obj.addCustomDOMProperties = function (customDOMProperties) {
        assertAddCustomDOMPropertiesOptions(customDOMProperties);

        var builder = new SelectorBuilder(getSelector(), { customDOMProperties: customDOMProperties }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomMethodsMethod(obj, getSelector, SelectorBuilder) {
    obj.addCustomMethods = function (methods, opts) {
        assertAddCustomMethods(methods, opts);

        var customMethods = {};

        (0, _keys2.default)(methods).forEach(function (methodName) {
            customMethods[methodName] = {
                method: methods[methodName],
                returnDOMNodes: opts && !!opts.returnDOMNodes
            };
        });

        var builder = new SelectorBuilder(getSelector(), { customMethods: customMethods }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addHierarchicalSelectors(obj, getSelector, SelectorBuilder) {
    // Find
    obj.find = function (filter, dependencies) {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function], 'find', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                if (typeof filter === 'string') {
                    return typeof node.querySelectorAll === 'function' ? node.querySelectorAll(filter) : null;
                }

                var results = [];

                var visitNode = function visitNode(currentNode) {
                    var cnLength = currentNode.childNodes.length;

                    for (var i = 0; i < cnLength; i++) {
                        var child = currentNode.childNodes[i];

                        results.push(child);

                        visitNode(child);
                    }
                };

                visitNode(node);

                return filterNodes(results, filter, null, node);
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };

    // Parent
    obj.parent = function (filter, dependencies) {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'parent', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                var parents = [];

                for (var parent = node.parentNode; parent; parent = parent.parentNode) {
                    parents.push(parent);
                }return filter !== void 0 ? filterNodes(parents, filter, document, node) : parents;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };

    // Child
    obj.child = function (filter, dependencies) {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'child', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                var childElements = [];
                var cnLength = node.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = node.childNodes[i];

                    if (child.nodeType === 1) childElements.push(child);
                }

                return filter !== void 0 ? filterNodes(childElements, filter, node, node) : childElements;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };

    // Sibling
    obj.sibling = function (filter, dependencies) {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'sibling', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                var parent = node.parentNode;

                if (!parent) return null;

                var siblings = [];
                var cnLength = parent.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = parent.childNodes[i];

                    if (child.nodeType === 1 && child !== node) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };

    // Next sibling
    obj.nextSibling = function (filter, dependencies) {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'nextSibling', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                var parent = node.parentNode;

                if (!parent) return null;

                var siblings = [];
                var cnLength = parent.childNodes.length;
                var afterNode = false;

                for (var i = 0; i < cnLength; i++) {
                    var child = parent.childNodes[i];

                    if (child === node) afterNode = true;else if (afterNode && child.nodeType === 1) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };

    // Prev sibling
    obj.prevSibling = function (filter, dependencies) {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'prevSibling', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = function selectorFn() {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, function (node) {
                var parent = node.parentNode;

                if (!parent) return null;

                var siblings = [];
                var cnLength = parent.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = parent.childNodes[i];

                    if (child === node) break;

                    if (child.nodeType === 1) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults: expandSelectorResults });
    };
}

function addAPI(obj, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    addSnapshotPropertyShorthands(obj, getSelector, SelectorBuilder, customDOMProperties, customMethods);
    addCustomDOMPropertiesMethod(obj, getSelector, SelectorBuilder);
    addCustomMethodsMethod(obj, getSelector, SelectorBuilder);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierarchicalSelectors(obj, getSelector, SelectorBuilder);
    addCounterProperties(obj, getSelector, SelectorBuilder);
}