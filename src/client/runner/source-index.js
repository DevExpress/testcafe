import testCafeCore from './deps/testcafe-core';

var SETTINGS = testCafeCore.SETTINGS;


const SOURCE_INDEX_ARG_REGEXP = /#(\d+)/;


function arrForEach (arr, func) {
    for (var i = 0; i < arr.length; i++)
        func(arr[i], i);
}


export var currentIndex = null;

export function wrapTrackableMethods (methodsHost, methodNames) {
    arrForEach(methodNames, function (methName) {
        var originalMeth = methodsHost[methName];

        methodsHost[methName] = function () {
            var args = Array.prototype.slice.call(arguments);

            if (SETTINGS.get().ENABLE_SOURCE_INDEX) {
                var idxArg   = args[args.length - 1],
                    idxMatch = typeof idxArg === 'string' && idxArg.match(SOURCE_INDEX_ARG_REGEXP);

                //NOTE: check if we actually have sourc index. Because in some edge case it can't be
                //calcualted by compiler
                if (idxMatch) {
                    exports.currentIndex = parseInt(idxMatch[1], 10);
                    args.pop();
                }
            }

            return originalMeth.apply(this, args);
        };
    });
}
