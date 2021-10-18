const extensionKeys = Object.keys(require.extensions);

const realExtensions: { [key: string]: Function } = {};

for (const ext of extensionKeys) {
    realExtensions[ext] = require.extensions[ext];

    require.extensions[ext] = (mod, filename) => {
        // @ts-ignore
        const hook = global.customExtensionHook;

        if (hook)
            hook();
        else
            realExtensions[ext](mod, filename);
    };
}

// eslint-disable-next-line
require = require('@miherlosev/esm')(module);

module.exports = require('./service');
