import CoffeeScript from 'coffeescript';
import { transform } from '@babel/core';
import ESNextTestFileCompiler from '../es-next/compiler.js';
import { EsNextTestFileParser } from '../es-next/get-test-list';

export class CoffeeScriptTestFileParser extends EsNextTestFileParser {
    parse (code) {
        const babelOptions = ESNextTestFileCompiler.getBabelOptions(null, code);

        delete babelOptions.filename;
        babelOptions.ast = true;

        code = CoffeeScript.compile(code, {
            bare:      true,
            sourceMap: false,
            inlineMap: false,
            header:    false
        });

        const ast = transform(code, babelOptions).ast;

        return this.analyze(ast.program.body);
    }
}

const parser = new CoffeeScriptTestFileParser();

export const getCoffeeScriptTestList         = parser.getTestList.bind(parser);
export const getCoffeeScriptTestListFromCode = parser.getTestListFromCode.bind(parser);
