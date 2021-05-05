import { TestRunDispatcherProtocol } from './compiler/protocol';
import { Dictionary } from '../configuration/interfaces';
import Test from '../api/structure/test';

export interface TestRunProxyInit {
    dispatcher: TestRunDispatcherProtocol;
    id: string;
    test: Test;
    options: Dictionary<OptionValue>;
}
