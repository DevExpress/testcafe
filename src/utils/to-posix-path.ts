import { sep, posix } from 'path';

export default function (val = ''): string {
    return val.split(sep)
        .join(posix.sep);
}
