module.exports.createTestStream = () => {
    const stream = {
        data:  '',
        write: val => stream.data += val,
        end:   val => stream.data += val
    };

    return stream;
};

module.exports.createNullStream = () => {
    return {
        write: () => {},
        end: () => {}
    };
};
