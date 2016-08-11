export default function renderTemplate (template, ...args) {
    var counter = 0;

    return template.replace(/{.+?}/g, () => args[counter++]);
}
