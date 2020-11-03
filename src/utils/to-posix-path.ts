import { sep, posix } from 'path';

export default function (val: string = ''): string {
    return val.split(sep)
        .join(posix.sep);
}
