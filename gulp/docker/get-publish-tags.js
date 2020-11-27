const semver = require('semver');

const DEFAULT_TAG     = 'latest';
const VALID_TAGS_LIST = [DEFAULT_TAG, 'alpha', 'rc'];

module.exports = function getPublishTags (packageInfo) {
    const tag = semver.parse(packageInfo.version).prerelease[0] || DEFAULT_TAG;

    if (!VALID_TAGS_LIST.includes(tag))
        throw new Error('Incorrect version in package.json');

    return [packageInfo.version, tag];
};
