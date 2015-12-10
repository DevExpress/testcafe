import pify from 'pify';
import Promise from 'pinkie';

export default function (fn) {
    return pify(fn, Promise);
}
