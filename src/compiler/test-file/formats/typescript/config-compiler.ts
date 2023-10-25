/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-debugger */
import TypeScriptFileCompilerBase from './compiler';
import path from 'path';
import { TypescriptConfigurationBase } from '../../../../configuration/typescript-configuration';
import { Dictionary } from '../../../../configuration/interfaces';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS } from '../../../../configuration/default-values';

class TypescriptDefaultConfiguration implements TypescriptConfigurationBase {
    getOptions (options: any): Dictionary<OptionValue> {
        debugger;
        if (options?.configPath) {
            const compileOptions = require(path.resolve(options.configPath));

            return compileOptions;
        }
        else if (options)
            return options;


        return DEFAULT_TYPESCRIPT_COMPILER_OPTIONS;
    }

    init (): Promise<void> {
        return Promise.resolve();
    }
}

export default class TypeScriptConfigurationCompiler extends TypeScriptFileCompilerBase {
    createTypescriptConfiguration (): TypescriptConfigurationBase {
        return new TypescriptDefaultConfiguration();
    }

    async compileConfiguration (filename: string) : Promise<object | null> {
        let compiledConfigurationModule = null;

        const [compiledCode] = await this.precompile([{ code: '', filename }]);

        if (compiledCode) {
            this._setupRequireHook({ });

            compiledConfigurationModule = await this._runCompiledCode({}, compiledCode, filename);

            this._removeRequireHook();

            return compiledConfigurationModule.exports;
        }

        return null;
    }
}
