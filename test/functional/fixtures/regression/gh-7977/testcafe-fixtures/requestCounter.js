let count = 0;

const requestCounter = {
    add (value) {
        count += value;
    },
    get () {
        return count;
    },
};

module.exports = requestCounter;
