const FileStorage = require('../../../utils/file-storage');

const unhandledRejection = new FileStorage('unhandled-rejection.json', __dirname);

module.exports = unhandledRejection;
