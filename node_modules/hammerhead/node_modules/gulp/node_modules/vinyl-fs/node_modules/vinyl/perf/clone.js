var File = require('../');

var contents = new Buffer('blah blah blah');

var originalFile = new File({
  path: 'yo.coffee',
  contents: contents
});

// simulate some history
originalFile.path = 'yo.js';
originalFile.path = 'yo.js';
originalFile.path = 'yo.js';
originalFile.path = 'yo.js';
originalFile.path = 'yo.js';

originalFile.ast = {
  a: {
    b: {
      c: {
a: {
    b: {
      c: {
a: {
    b: {
      c: {
a: {
    b: {
      c: {
a: {
    b: {
      c: {
a: {
    b: {
      c: {

      }
    }
  }
      }
    }
  }
      }
    }
  }
      }
    }
  }
      }
    }
  }
      }
    }
  }
};

for (var i = 0; i < 10000; i++) {
  originalFile.clone(true).ast;
}