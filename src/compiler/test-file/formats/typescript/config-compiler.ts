/* eslint-disable linebreak-style */
import TypeScriptFileCompilerBase from './compiler';
import { TypescriptConfigurationBase } from '../../../../configuration/typescript-configuration';
import { Dictionary } from '../../../../configuration/interfaces';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS } from '../../../../configuration/default-values';

class TypescriptDefaultConfiguration implements TypescriptConfigurationBase {
    getOptions (): Dictionary<OptionValue> {
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
