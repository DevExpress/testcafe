export default function (key) {
    return key.length === 1 && (key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z');
}
