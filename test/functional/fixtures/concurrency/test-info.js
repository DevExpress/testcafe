const FileStorage = require('../../utils/file-storage');

const testInfo = new FileStorage('test-info.json', __dirname);

module.exports = testInfo;
