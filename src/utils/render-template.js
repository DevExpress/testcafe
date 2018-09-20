export default function renderTemplate (template, ...args) {
    if (!args.length)
        return template;

    let counter = 0;

    return template.replace(/{.+?}/g, match => counter < args.length ? args[counter++] : match);
}
