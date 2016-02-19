module.exports = {
    browsersPassingQuarantine: {},
    browsersFailingQuarantine: {},

    handleFailingSequence: function (ua) {
        // NOTE: Failing sequence: 1st run - fail, 2nd - pass, 3rd and 4th - fail
        var state = this.browsersFailingQuarantine[ua] || { step: 0 };

        state.step++;

        this.browsersFailingQuarantine[ua] = state;

        if (state.step === 2)
            return 'pass';

        return 'fail';
    },

    handlePassingSequence: function (ua) {
        // NOTE: Passing sequence: 1st run - fail, 2nd, 3rd and 4th - pass
        var state = this.browsersPassingQuarantine[ua] || { step: 0 };

        state.step++;

        this.browsersPassingQuarantine[ua] = state;

        if (state.step === 1)
            return 'fail';

        return 'pass';
    },

    clearPassingBrowsers: function () {
        this.browsersPassingQuarantine = {};
    },

    clearFailingBrowsers: function () {
        this.browsersFailingQuarantine = {};
    }
};
