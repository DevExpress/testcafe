const fs   = require('fs');
const path = require('path');

const TIMELINE_FILENAME  = 'concurrency_test_timeline.txt';
const FULL_TIMELINE_PATH = path.resolve(__dirname, '..', TIMELINE_FILENAME);

exports.getTimeline = () => {
    const data = fs.readFileSync(FULL_TIMELINE_PATH).toString();

    return JSON.parse(data);
};

exports.deleteTimeline = () => {
    if (fs.existsSync(FULL_TIMELINE_PATH))
        fs.unlinkSync(FULL_TIMELINE_PATH);
};

exports.saveTimeline = (timeline) => {
    fs.writeFileSync(FULL_TIMELINE_PATH, JSON.stringify(timeline));
};
