const IN_DEBUG_MODE = typeof v8debug !== 'undefined' || /--debug|--inspect/.test(process.execArgv.join(' '));

module.exports = function getTimeout (value) {
    return IN_DEBUG_MODE ? Infinity : value;
};
