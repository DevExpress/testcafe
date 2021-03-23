import { TestRunDispatcherProtocol } from './compiler/protocol';
import { Dictionary } from '../configuration/interfaces';

export interface TestRunProxyInit {
    dispatcher: TestRunDispatcherProtocol;
    id: string;
    fixtureCtx: unknown;
    options: Dictionary<OptionValue>;
}
