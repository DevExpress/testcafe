'@fixture Using shared code in iframe pages';
'@page ./index.html';

'@require :testModule';
'@require ./mixins.js';


var basePath = 'http://localhost:3000/legacy-fixtures/using-shared-code/pages/';


'@test'['Using shared code in iframe'] = {
    '@testCases': [
        { '@name': 'Cross-domain iframe', pageUrl: 'cross-domain.html' },
        { '@name': 'Same-domain iframe', pageUrl: 'same-domain.html' },
        { '@name': 'Inline iframe', pageUrl: 'inline.html' }
    ],

    '1.Navigate to test page': function () {
        this.text = 'test';

        act.navigateTo(basePath + this.pageUrl);
    },

    '2.Type in input': inIFrame('#iframe', function () {
        act.type(getInput, this.text);
    }),

    '3.Check input value': inIFrame('#iframe', function () {
        eq($('#input')[0].value, this.text);
    })
};

'@test'['Using mixin in iframe'] = {
    '@testCases': [
        { '@name': 'Cross-domain iframe', pageUrl: 'cross-domain.html' },
        { '@name': 'Same-domain iframe', pageUrl: 'same-domain.html' },
        { '@name': 'Inline iframe', pageUrl: 'inline.html' }
    ],

    '1.Navigate to test page': function () {
        this.text = 'test';

        act.navigateTo(basePath + this.pageUrl);
    },

    '2.Type in input': '@mixin Type in input in iframe',

    '3.Check input value': inIFrame('#iframe', function () {
        eq($('#input')[0].value, this.text);
    })
};
