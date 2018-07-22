import CoffeeScript from 'coffeescript';
import loadBabelLibs from '../../../load-babel-libs';
import ESNextTestFileCompiler from '../es-next/compiler.js';

const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|'|")/;
const TEST_RE    = /(^|;|\s+)test\s*/;

export default class CoffeeScriptTestFileCompiler extends ESNextTestFileCompiler {
    _hasTests (code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    }

    _compileCode (code, filename) {
        if (this.cache[filename])
            return this.cache[filename];

        var transpiled = CoffeeScript.compile(code, {
            filename,
            sourceMap: true,
            inlineMap: true,
            header:    false
        });

        var { babel }    = loadBabelLibs();
        var babelOptions = ESNextTestFileCompiler.getBabelOptions(filename, code);
        var compiled     = babel.transform(transpiled.js, babelOptions);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers () {
        return { '.coffee': (code, filename) => this._compileCode(code, filename) };
    }

    getSupportedExtension () {
        return '.coffee';
    }
}
