'@fixture click';
'@page http://localhost:3000/legacy-fixtures/upload/pages/index.html';

'@require ../../../../../../legacy-fixtures/upload/testcafe-fixtures/mixin.js';


'@test'['Upload a file'] = {
    '1.Upload text1.txt': function () {
        var file = '../../../../../../legacy-fixtures/upload/testcafe-fixtures/files/text1.txt';

        act.upload('#fileInput', file);
    },

    '2.Submit files': function () {
        act.click('#submitBtn');
    },

    '3. Check text1 upload': '@mixin Check text1.txt upload'
};

