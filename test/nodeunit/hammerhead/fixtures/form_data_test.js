var fs = require('fs'),
    path = require('path'),
    FormData = require('../../../../hammerhead/lib/form_data').FormData;

var boundary = 'separator',
    readFile = function(fileName) {
        return fs.readFileSync(path.join(__dirname, '../data/proxy/data_form_processing/' + fileName + '.formdata'))
    },
    formDataFiles = {
        'empty': readFile('empty'),
        'empty_with_separator': readFile('empty_with_separator'),
        'empty_with_separator_and_newline': readFile('empty_with_separator_and_newline'),
        'filename_name': readFile('filename_name'),
        'filename_no_name': readFile('filename_no_name'),
        'preamble_newline': readFile('preamble_newline'),
        'preamble_string': readFile('preamble_string'),
        'epilogue_string': readFile('epilogue_string'),
        'special_chars_in_file_name': readFile('special_chars_in_file_name'),
        'missing_hyphens': readFile('missing_hyphens'),
        'empty_headers': readFile('empty_headers')
    };

exports['Parse'] = {
    'Empty form data': function (t) {
        [
            formDataFiles['empty'],
            formDataFiles['empty_with_separator'],
            formDataFiles['empty_with_separator_and_newline']
        ].forEach(function(formDataBuf) {
            var formData = new FormData();

            console.log('boundary ', boundary);

            formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);

            console.log('formDataBuf ', JSON.stringify(formDataBuf));

            console.log('formData.params.length ', formData.params.length);
            formData.parse(formDataBuf);

            console.log('params', JSON.stringify(formData.params));
            t.strictEqual(formData.params.length, 0);
             console.log('preamble', JSON.stringify(formData.preamble));
            t.strictEqual(formData.preamble.length, 0);
        });

        t.done();
    }/*,
    'File name - name': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['filename_name']);
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, 'plain.txt');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file\r\n');

        t.done();
    },
    'File name - no name': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['filename_no_name']);
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, '');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file');

        t.done();
    },
    'Preamble - new line': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['preamble_newline']);
        t.strictEqual(formData.preamble.length, 1);
        t.strictEqual(formData.preamble[0].length, 0);
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, 'plain.txt');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file\r\n');

        t.done();
    },
    'Preamble - string': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['preamble_string']);
        t.strictEqual(formData.preamble.length, 1);
        t.strictEqual(formData.preamble[0].toString(), 'This is a preamble which should be ignored');
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, 'plain.txt');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file\r\n');

        t.done();
    },
    'Epilogue - string': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['epilogue_string']);
        t.strictEqual(formData.preamble.length, 1);
        t.strictEqual(formData.preamble[0].toString(), 'This is a preamble which should be ignored');
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, 'plain.txt');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file\r\n');
        t.strictEqual(formData.params[1].name, 'textView');
        t.strictEqual(Buffer.concat(formData.params[1].body).toString(), 'Regular text');
        t.strictEqual(formData.epilogue.length, 1);
        t.strictEqual(formData.epilogue[0].toString(), 'This is a epilogue which should be ignored');

        t.done();
    },
    'Special chars in filename': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['special_chars_in_file_name']);
        t.strictEqual(formData.preamble.length, 0);
        t.strictEqual(formData.params[0].name, 'title');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'Weird filename');
        t.strictEqual(formData.params[1].name, 'upload');
        t.strictEqual(formData.params[1].fileName, ': \\ ? % * | &#9731; %22 < > . ? ; \' @ # $ ^ & ( ) - _ = + { } [ ] ` ~.txt');
        t.strictEqual(formData.params[1].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[1].body).toString(), 'I am a text file with a funky name!\r\n');

        t.done();
    },
    'Missing hyphens': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['missing_hyphens']);
        t.strictEqual(formData.preamble.length, 0);
        t.strictEqual(formData.params[0].name, 'upload');
        t.strictEqual(formData.params[0].fileName, 'plain.txt');
        t.strictEqual(formData.params[0].headers['Content-Type'], 'text/plain');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'I am a plain text file\r\n');

        t.done();
    },
    'Empty headers': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['empty_headers']);
        t.strictEqual(formData.preamble.length, 0);
        t.strictEqual(formData.params[0].name, null);
        t.strictEqual(formData.params[0].fileName, undefined);
        t.strictEqual(formData.params[0].headers['Content-Type'], '');
        t.strictEqual(formData.params[0].headers['Content-Disposition'], '');
        t.strictEqual(Buffer.concat(formData.params[0].body).toString(), 'text');

        t.done();
    }*/
};

/*exports['Format'] = {
    'Empty form data': function (t) {
        [
            formDataFiles['empty'],
            formDataFiles['empty_with_separator'],
            formDataFiles['empty_with_separator_and_newline']
        ].forEach(function(formDataBuf) {
            var formData = new FormData();

            formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
            formData.parse(formDataBuf);
            t.strictEqual(formData.toBuffer().toString(), '--' + boundary + '--\r\n');
        });

        t.done();
    },
    'Filename - name': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['filename_name']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['filename_name'].toString());

        t.done();
    },
    'File name - no name': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['filename_no_name']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['filename_no_name'].toString());

        t.done();
    },
    'Preamble - new line': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['preamble_newline']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['preamble_newline'].toString());

        t.done();
    },
    'Preamble - string': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['preamble_string']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['preamble_string'].toString());

        t.done();
    },
    'Epilogue - string': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['epilogue_string']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['epilogue_string'].toString());

        t.done();
    },
    'Special chars in filename': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['special_chars_in_file_name']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['special_chars_in_file_name'].toString());

        t.done();
    },
    'Missing hyphens': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['missing_hyphens']);
        t.strictEqual(formData.toBuffer().toString(), formDataFiles['missing_hyphens'].toString() + '--\r\n');

        t.done();
    },
    'Empty headers': function(t) {
        var formData = new FormData();

        formData.parseContentTypeHeader('multipart/form-data; boundary=' + boundary);
        formData.parse(formDataFiles['empty_headers']);
        t.strictEqual(formData.toBuffer().toString().replace(/ /g, ''), formDataFiles['empty_headers'].toString().replace(/ /g, ''));

        t.done();
    }
};*/
