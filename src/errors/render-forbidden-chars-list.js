export default function (forbiddenCharsList) {
    return forbiddenCharsList.map(charInfo => `\t"${charInfo.chars}" at index ${charInfo.index}\n`).join('');
}
