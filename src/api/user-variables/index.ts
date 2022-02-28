export default {
    _variables: null as UserVariables | null,

    get value () {
        return this._variables;
    },

    set value (value) {
        this._variables = value;
    },
};
