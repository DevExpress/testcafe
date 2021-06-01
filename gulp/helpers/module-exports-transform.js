const { Transform } = require('stream');

module.exports = new Transform({
    objectMode: true,

    transform (file, enc, cb) {
        const fileSource = file.contents.toString();

        if (fileSource.includes('exports.default =')) {
            const sourceMapIndex = fileSource.indexOf('//# sourceMappingURL');
            const modifiedSource = fileSource.slice(0, sourceMapIndex) + 'module.exports = exports.default;\n' + fileSource.slice(sourceMapIndex);

            file.contents = Buffer.from(modifiedSource);
        }

        cb(null, file);
    }
});
