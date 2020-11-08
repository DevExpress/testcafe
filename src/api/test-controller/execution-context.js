import { createContext } from 'vm';
import Module from 'module';
import path from 'path';
import exportableLib from '../exportable-lib';
import NODE_MODULES from '../../shared/node-modules-folder-name';

const OPTIONS_KEY = Symbol('options');

function getModuleBasePaths (currentPath) {
    const nodePaths = [];
    let parentDir   = path.dirname(currentPath);

    while (currentPath !== parentDir) {
        currentPath = parentDir;
        parentDir   = path.dirname(currentPath);

        nodePaths.push(path.join(currentPath, NODE_MODULES));
    }

    return nodePaths;
}

function createRequire (filename) {
    //Deprecated since: Node v12.2.0
    if (Module.createRequireFromPath)
        return Module.createRequireFromPath(filename);

    if (Module.createRequire)
        return Module.createRequire(filename);

    const dummyModule          = new Module(filename, module);
    const localModulesPaths    = getModuleBasePaths(filename);

    dummyModule.filename = filename;
    dummyModule.paths    = localModulesPaths.concat(module.paths);

    return id => dummyModule.require(id);
}

function createSelectorDefinition (testRun) {
    return (fn, options = {}) => {
        const { skipVisibilityCheck, collectionMode } = testRun.controller.getExecutionContext()[OPTIONS_KEY];

        if (skipVisibilityCheck)
            options.visibilityCheck = false;

        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        if (collectionMode)
            options.collectionMode = collectionMode;

        return exportableLib.Selector(fn, options);
    };
}

function createClientFunctionDefinition (testRun) {
    return (fn, options = {}) => {
        if (testRun && testRun.id)
            options.boundTestRun = testRun;

        return exportableLib.ClientFunction(fn, options);
    };
}

export function setContextOptions (context, options) {
    context[OPTIONS_KEY] = options;
}

export function createExecutionContext (testRun) {
    const filename = testRun.test.testFile.filename;

    const replacers = {
        require:        createRequire(filename),
        __filename:     filename,
        __dirname:      path.dirname(filename),
        t:              testRun.controller,
        Selector:       createSelectorDefinition(testRun),
        ClientFunction: createClientFunctionDefinition(testRun),
        Role:           exportableLib.Role,
        RequestLogger:  exportableLib.RequestLogger,
        RequestMock:    exportableLib.RequestMock,
        RequestHook:    exportableLib.RequestHook
    };

    return createContext(new Proxy(replacers, {
        get: (target, property) => {
            if (replacers.hasOwnProperty(property))
                return replacers[property];

            if (global.hasOwnProperty(property))
                return global[property];

            throw new Error(`${property} is not defined`);
        }
    }));
}
