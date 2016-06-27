'@fixture upload regression';
'@page ./regression.html';

'@require ./mixin.js';


'@test'['Upload by using an added element'] = {
    '1.Add input element': function () {
        act.click('#addInputBtn');
    },

    '2.Upload text1.txt': function () {
        act.upload('#addedInput', './files/text1.txt');
    },

    '3.Submit files': function () {
        act.click('#submitBtn');
    },

    '4. Check text1 upload': '@mixin Check text1.txt upload'
};

'@test'['Upload by using a replaced element'] = {
    '1.Upload text1.txt to input1': function () {
        act.upload('#input1', './files/text1.txt');
    },

    '2.Upload text2.txt to input2': function () {
        act.upload('#input2', './files/text2.txt');
    },

    '3.Replace input element': function () {
        act.click('#replaceInputBtn');
    },

    '4.Submit files': function () {
        act.click('#submitBtn');
    },

    '5. Check text1 upload': '@mixin Check text1.txt upload'
};

'@test'['Upload by using a removed element'] = {
    '1.Upload text1.txt, text2.txt': function () {
        act.upload('#delInput', './files/text1.txt');
    },

    '2.Delete input element': function () {
        act.click('#delInputBtn');
    },

    '3.Submit files': function () {
        act.click('#submitBtn');
    },

    '4. Check empty upload': '@mixin Check empty upload'
};
