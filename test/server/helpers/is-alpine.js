const fs = require('fs');


const ALPINE_RELEASE_INFO_PATH = '/etc/alpine-release';

module.exports = function () {
    return fs.existsSync(ALPINE_RELEASE_INFO_PATH);
};
