import TestTimeout from './test-timeout';

export interface AuthCredentials {
    username: string;
    password: string;
    domain?: string;
    workstation?: string;
}

export type TestTimeouts = {
    [key in TestTimeout]?: number;
}
