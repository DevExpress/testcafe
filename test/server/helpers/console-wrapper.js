const wrapper = {
    messages: {
        log:   null,
        clear: function () {
            this.log = null;
        }
    }
};

wrapper.log = (...args) => {
    wrapper.messages.log = args.join();
};

module.exports = wrapper;
