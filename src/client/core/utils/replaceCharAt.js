export default function replaceCharAt (str, pos, value) {
    var array  = str.split('');

    array[pos] = value;

    return array.join('');
}
