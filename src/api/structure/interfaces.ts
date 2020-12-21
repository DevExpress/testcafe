import { Dictionary } from '../../configuration/interfaces';

export type Metadata = Dictionary<string>;

export interface AuthCredentials {
    username: string;
    password: string;
    domain?: string;
    workstation?: string;
}

export interface TestTimeouts {
    pageRequestTimeout?: number;
    ajaxRequestTimeout?: number;
}
