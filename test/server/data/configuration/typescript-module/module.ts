const addModule = require('./additional-module');

function greet (): string {
    addModule();
    return 'Hello World!';
}

module.exports = { greet };
