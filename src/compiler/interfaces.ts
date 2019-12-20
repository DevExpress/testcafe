import { Test } from '../api/structure/interfaces';

export interface CompilerArguments {
    sourceList: string[];
    compilerOptions: object;
}

export interface CompilerProvider {
    init(): Promise<void>;
    getTests(args: CompilerArguments): Promise<Test[]>;
}
