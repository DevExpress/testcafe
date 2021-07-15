export default {
    _variables: null as OptionValue,

    get value () {
        return this._variables;
    },

    set value (value) {
        this._variables = value;
    },
};
