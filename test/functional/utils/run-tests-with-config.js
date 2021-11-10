const path           = require('path');
const createTestCafe = require('../../../lib');

module.exports = async (testName, configPath) => {
    if (!configPath)
        throw new Error('"configPath" isn\'t defined');

    const cafe        = await createTestCafe({ configFile: path.resolve(configPath) });
    const runner      = cafe.createRunner();
    const failedCount = await runner.run();

    await cafe.close();

    return failedCount;
};
