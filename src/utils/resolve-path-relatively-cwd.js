import { resolve } from 'path';

export default function (path) {
    return resolve(process.cwd(), path);
}
