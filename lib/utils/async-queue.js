'use strict';

exports.__esModule = true;
exports.isInQueue = isInQueue;
exports.addToQueue = addToQueue;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = {};

function isInQueue(key) {
    return actions[key];
}

function addToQueue(key, asyncAction) {
    var action = actions[key] || _pinkie2.default.resolve();

    actions[key] = action.then(function () {
        return asyncAction();
    });

    return actions[key];
}