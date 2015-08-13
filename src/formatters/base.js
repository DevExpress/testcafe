import { AssertionErrMsg } from './assertion-err-msg';

exports.buildAssertion = function (err, type, maxStrLength) {
    return (new AssertionErrMsg(err, type, maxStrLength)).build();
};

exports.wrapSourceCode = function (code) {
    return `<related-code>${code}</related-code>`;
};

exports.wrapCode = function (code) {
    return `<js>${code}</js>`;
};

exports.wrapLink = function (link) {
    return `<link>${link}</link>`;
};

exports.wrapStepName = function (stepName) {
    return `<step-name>${stepName}</step-name>`;
};


