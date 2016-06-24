'@fixture Upload';
'@page ./index.html';

'@require ./mixin.js';

'@test'['Upload a file'] = {
    '1.Upload text1.txt': function () {
        var file = './files/text1.txt';

        act.upload('#fileInput', file);
    },

    '2.Submit files': function () {
        act.click('#submitBtn');
    },

    '3. Check text1 upload': '@mixin Check text1.txt upload'
};

'@test'['Upload multiple files'] = {
    '1.Upload text1.txt, text2.txt': function () {
        var files = ['./files/text1.txt', './files/text2.txt'];

        act.upload('#fileInput', files);
    },

    '2.Submit files': function () {
        act.click('#submitBtn');
    },

    '3. Check text1 upload': '@mixin Check text1.txt upload',

    '3. Check text2 upload': '@mixin Check text2.txt upload'
};

'@test'['Clear upload'] = {
    '1.Upload text1.txt': function () {
        var file = './files/text1.txt';

        act.upload('#fileInput', file);
    },

    '1.Clear file upload': function () {
        act.upload('#fileInput');
    },

    '3.Submit files': function () {
        act.click('#submitBtn');
    },

    '4. Check that text1 is not uploaded': '@mixin Check empty upload'
};

'@test'['Upload a non-existent file - should fail'] = {
    '1.Upload "fake.jpg" file': function () {
        var file = './files/fake.jpg';

        act.upload('#fileInput', file);
    },

    '2. Check empty upload': '@mixin Check empty upload'
};

'@test'['Upload multiple files inc. non-existent - should fail'] = {
    '1.Upload multiple files': function () {
        var files = ['./files/text1.txt', './files/fake1.jpg', './files/fake2.jpg'];

        act.upload('#fileInput', files);
    },

    '2. Check empty upload': '@mixin Check empty upload'
};
