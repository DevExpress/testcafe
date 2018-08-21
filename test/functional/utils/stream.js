module.exports.createTestStream = () => {
    const stream = {
        data:  '',
        write: function (val) {
            this.data += val;
        },
        end: function (val) {
            this.data += val;
        }
    };

    return stream;
};

module.exports.createNullStream = () => {
    return {
        write: () => {},
        end:   () => {}
    };
};
