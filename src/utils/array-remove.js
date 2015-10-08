export default function (arr, item) {
    var idx = arr.indexOf(item);

    arr.splice(idx, 1);
}
