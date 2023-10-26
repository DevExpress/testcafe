/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-debugger */
import TypeScriptFileCompilerBase from './compiler';
import path from 'path';
import { TypescriptConfigurationBase } from '../../../../configuration/typescript-configuration';
import { Dictionary } from '../../../../configuration/interfaces';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS } from '../../../../configuration/default-values';
import JSON5 from 'json5';
import { readFile, stat } from '../../../../utils/promisified-functions';

class TypescriptDefaultConfiguration implements TypescriptConfigurationBase {

    private configPath: string | null;
    constructor (tsConfigPath: string | null) {
        this.configPath = tsConfigPath;
    }

    getOptions (): Dictionary<OptionValue> {
        debugger;
        // if (options?.configPath) {
        //     const compileOptions = require(path.resolve(options.configPath));

        //     return compileOptions;
        // }
        // else if (options)
        //     return options;


        return DEFAULT_TYPESCRIPT_COMPILER_OPTIONS;
    }

    async init (): Promise<void> {
        if (this.configPath)
            await this.load(this.configPath);

        return Promise.resolve();
    }

    private async load (configPath: string): Promise<null | object> {
        if (!await this._isConfigurationFileExists(configPath))
            return { configPath };

        const configurationFileContent = await this._readConfigurationFileContent(configPath);
        let options;

        if (configurationFileContent)
            options = this._parseConfigurationFileContent(configurationFileContent);

        if (options)
            return options;

        return Promise.resolve(null);
    }

    protected async _isConfigurationFileExists (filePath: string): Promise<boolean> {
        try {
            await stat(filePath);

            return true;
        }
        catch (error: any) {


            return false;
        }
    }

    public async _readConfigurationFileContent (filePath: string): Promise<Buffer | null> {
        try {
            return await readFile(filePath);
        }
        catch (error: any) {
            console.log(error);
        }

        return null;
    }

    private _parseConfigurationFileContent (configurationFileContent: Buffer): object | null {
        try {
            return JSON5.parse(configurationFileContent.toString());
        }
        catch (error: any) {
            console.log(error);
        }

        return null;
    }

}

export default class TypeScriptConfigurationCompiler extends TypeScriptFileCompilerBase {

    createTypescriptConfiguration (configPath: string | null): TypescriptConfigurationBase {
        return new TypescriptDefaultConfiguration(configPath);
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
