//const { expect } = require('chai');
const dedent = require('dedent');

function isNotStdStream (stream) {
    return ![
        process.stdin,
        process.stdout,
        process.stderr,
    ].includes(stream);
}

afterEach(function () {
    const activeRequests = process._getActiveRequests();
    const activeHandles  = process._getActiveHandles().filter(isNotStdStream);

    if (!activeHandles.length && !activeRequests.length)
        return;

    const activeRequestsString = activeRequests.toString();

    const activeHandlersString = activeHandles.map(handler => {
        if (typeof handler.constructor === 'function') {
            const handlerString = handler.constructor.name;

            if (handlerString === 'Socket')
                console.dir(handler); //eslint-disable-line

            return handlerString;
        }

        return handler.toString();
    });

    const message = dedent(`There are non released resources after test execution.
                            Test: ${this.currentTest.title} (${this.currentTest.file})
                            Requests: ${activeRequestsString}
                            Handles: ${activeHandlersString}`);

    console.log(message); // eslint-disable-line
    //expect.fail(message);
});
