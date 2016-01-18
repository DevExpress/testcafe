export default function globalsInDepUndefined () {
    return typeof fixture === 'undefined' &&
           typeof tests === 'undefined' &&
           typeof page === 'undefined';
}
