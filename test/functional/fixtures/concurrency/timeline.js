const FileStorage = require('../../utils/file-storage');

const timeline = new FileStorage('timeline.json', __dirname);

module.exports = timeline;
