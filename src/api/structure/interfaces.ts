import { Dictionary } from '../../configuration/interfaces';
import TestTimeout from './test-timeout';

export type Metadata = Dictionary<string>;

export interface AuthCredentials {
    username: string;
    password: string;
    domain?: string;
    workstation?: string;
}

export type TestTimeouts = {
    [key in TestTimeout]?: number;
}
