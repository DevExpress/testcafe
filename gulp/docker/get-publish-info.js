const getPublishTags = require('./get-publish-tags');

module.exports = function getPublishInfo (packageInfo) {
    const PUBLISH_TAGS = getPublishTags(packageInfo);
    const PUBLISH_REPO = 'testcafe/testcafe';

    return {
        PUBLISH_TAGS,
        PUBLISH_REPO
    };
};

