const INDEX1_URL = 'http://localhost:3000/fixtures/regression/gh-1932/pages/index1.html';
const INDEX2_URL = 'http://localhost:3000/fixtures/regression/gh-1932/pages/index2.html';

const BASE_URL          = 'http://localhost:3000/fixtures/regression/gh-1932';
const FILE_PROTOCOL_URL = `${__dirname}`;


const INDEX1_RELATIVE_URL            = './pages/index1.html';
const INDEX2_RELATIVE_URL            = './pages/index2.html';
const INDEX1_WITH_UPDIR_RELATIVE_URL = './../gh-1932/pages/index1.html';

module.exports = {
    INDEX1_URL,
    INDEX2_URL,
    BASE_URL,
    FILE_PROTOCOL_URL,
    INDEX1_RELATIVE_URL,
    INDEX2_RELATIVE_URL,
    INDEX1_WITH_UPDIR_RELATIVE_URL,
};
