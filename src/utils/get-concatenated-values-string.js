export default function (array) {
    return array.map(item => `"${item}"`).join(', ');
}
