var ll = require('gulp-ll');
var requireAll = require('require-all');
var path = require('path');

ll
    .tasks([
        'lint',
        'server-scripts'
    ])
    .onlyInDebug([
        'styles',
        'client-scripts',
        'client-scripts-bundle'
    ]);

// require all tasks inside ./task directory
requireAll(path.join(__dirname, '/tasks/'));

