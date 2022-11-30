import { LOCALHOST_NAMES } from './localhost-names';

export default function (hostname: string): boolean {
    return Object.values(LOCALHOST_NAMES).includes(hostname);
}
