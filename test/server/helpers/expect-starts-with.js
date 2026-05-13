const { expect } = require('chai');
const { escapeRegExp } = require('lodash');

function expectStartsWith (value, expectedPrefix) {
    expect(value).to.match(new RegExp('^' + escapeRegExp(expectedPrefix)));
}

module.exports = expectStartsWith;
