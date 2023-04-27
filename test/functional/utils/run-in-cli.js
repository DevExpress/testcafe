const path     = require('path');
const { exec } = require('child_process');

module.exports = function runInCLI ({ testFile, browsers, args = [] }) {
    const testcafePath = path.resolve('bin/testcafe');
    const testFilePath = path.resolve(testFile);
    const command      = `node ${testcafePath} ${browsers} ${testFilePath} ${args.join(' ')}`;

    return new Promise(resolve => {
        exec(command, (error, stdout) => {
            resolve({ error, stdout });
        });
    });
};
