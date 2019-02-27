export default function getKeyProperties (isKeyPressEvent, key, keyIdentifier) {
    const properties = {};

    if ('keyIdentifier' in KeyboardEvent.prototype)
        properties.keyIdentifier = isKeyPressEvent ? '' : keyIdentifier;

    if ('key' in KeyboardEvent.prototype)
        properties.key = key;

    return properties;
}
