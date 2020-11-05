export default {
    presets: [{
        plugins: [
            require('babel-plugin-syntax-trailing-function-commas'),
            require('@babel/plugin-transform-async-to-generator'),
            require('@babel/plugin-transform-exponentiation-operator'),
            require('@babel/plugin-proposal-async-generator-functions'),
            require('@babel/plugin-proposal-object-rest-spread')
        ]
    }],
    plugins: [
        require('@babel/plugin-syntax-dynamic-import'),
        [require('@babel/plugin-proposal-decorators'), { 'legacy': true }],
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-async-generator-functions')
    ]
};
