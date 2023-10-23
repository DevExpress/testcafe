import TypeScriptFileCompilerBase from './compiler-base';
import TypescriptConfiguration, {
    TypescriptConfigurationBase,
} from '../../../../configuration/typescript-configuration';
import { TypeScriptCompilerOptions } from '../../../../configuration/interfaces';
import { OptionalCompilerArguments } from '../../../interfaces';

export default class TypeScriptTestFileCompiler extends TypeScriptFileCompilerBase {
    public constructor (compilerOptions?: TypeScriptCompilerOptions, { baseUrl, esm }: OptionalCompilerArguments = {}) {
        super(compilerOptions, { baseUrl, esm });
    }

    createTypescriptConfiguration (configPath: string | null, esm?: boolean): TypescriptConfigurationBase {
        return new TypescriptConfiguration(configPath, esm);
    }

}
