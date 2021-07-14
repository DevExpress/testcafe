const FileStorage = require('../../../utils/file-storage');

const storage = new FileStorage('actual.json', __dirname);

module.exports = storage;

