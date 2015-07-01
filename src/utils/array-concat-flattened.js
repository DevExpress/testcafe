var concat = [].concat;

export default function (oldArr, newArr) {
    return concat.apply(oldArr, newArr);
}
