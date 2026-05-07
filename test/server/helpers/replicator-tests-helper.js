'use strict';

// Replicator regression test helper for RCE via TypedArray deserialization (GH-16 in replicator repo).

const TICK_COUNT = 3;

function evilFunction () {
    global.evilFlag = true;
}

function makeIIFE (code) {
    return `(${code})()`;
}

function waitTick () {
    return new Promise(resolve => setTimeout(resolve));
}

function waitSomeTicks (tickCount) {
    let chain = Promise.resolve();

    for (let i = 0; i < tickCount; i++)
        chain = chain.then(waitTick);

    return chain;
}

module.exports.vulnerableData = JSON.stringify([{
    '@t': '[[TypedArray]]',

    'data': {
        'ctorName': 'setTimeout',

        'arr': {
            '@t': '[[TypedArray]]',

            'data': {
                'ctorName': 'Function',
                'arr':      makeIIFE(evilFunction.toString()),
            },
        },
    },
}]);

module.exports.checkIfBroken = function () {
    return waitSomeTicks(TICK_COUNT)
        .then(function () {
            return !!global.evilFlag;
        });
};

module.exports.resetEvilFlag = function () {
    global.evilFlag = false;
};
