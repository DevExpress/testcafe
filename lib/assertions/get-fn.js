'use strict';

exports.__esModule = true;
exports.default = getFn;

var _chai = require('chai');

function getFn(command) {
    switch (command.assertionType) {
        case 'eql':
            return function () {
                return _chai.assert.deepEqual(command.actual, command.expected, command.message);
            };

        case 'notEql':
            return function () {
                return _chai.assert.notDeepEqual(command.actual, command.expected, command.message);
            };

        case 'ok':
            return function () {
                return _chai.assert.isOk(command.actual, command.message);
            };

        case 'notOk':
            return function () {
                return _chai.assert.isNotOk(command.actual, command.message);
            };

        case 'contains':
            return function () {
                return _chai.assert.include(command.actual, command.expected, command.message);
            };

        case 'notContains':
            return function () {
                return _chai.assert.notInclude(command.actual, command.expected, command.message);
            };

        case 'typeOf':
            return function () {
                return _chai.assert.typeOf(command.actual, command.expected, command.message);
            };

        case 'notTypeOf':
            return function () {
                return _chai.assert.notTypeOf(command.actual, command.expected, command.message);
            };

        case 'gt':
            return function () {
                return _chai.assert.isAbove(command.actual, command.expected, command.message);
            };

        case 'gte':
            return function () {
                return _chai.assert.isAtLeast(command.actual, command.expected, command.message);
            };

        case 'lt':
            return function () {
                return _chai.assert.isBelow(command.actual, command.expected, command.message);
            };

        case 'lte':
            return function () {
                return _chai.assert.isAtMost(command.actual, command.expected, command.message);
            };

        case 'within':
            return function () {
                return (0, _chai.expect)(command.actual).to.be.within(command.expected, command.expected2, command.message);
            };

        case 'notWithin':
            return function () {
                return (0, _chai.expect)(command.actual).not.to.be.within(command.expected, command.expected2, command.message);
            };

        case 'match':
            return function () {
                return _chai.assert.match(command.actual, command.expected, command.message);
            };

        case 'notMatch':
            return function () {
                return _chai.assert.notMatch(command.actual, command.expected, command.message);
            };

        default:
            return function () {};
    }
}
module.exports = exports['default'];