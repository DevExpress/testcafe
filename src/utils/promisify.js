import pify from 'pify';

export default function (fn) {
    return pify(fn, Promise);
}
