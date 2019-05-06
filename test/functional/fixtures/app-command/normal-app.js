const http = require('http');
const fs   = require('fs');
const path = require('path');


const pageSource = fs.readFileSync(path.join(__dirname, 'static/index.html'));

http
    .createServer((req, res) => res.end(pageSource))
    .listen(3026);
