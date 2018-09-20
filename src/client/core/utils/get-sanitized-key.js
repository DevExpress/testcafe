import KEY_MAPS from './key-maps';

export default function getSanitizedKey (key) {
    const isChar       = key.length === 1 || key === 'space';
    let sanitizedKey = isChar ? key : key.toLowerCase();

    if (KEY_MAPS.modifiersMap[sanitizedKey])
        sanitizedKey = KEY_MAPS.modifiersMap[sanitizedKey];

    return sanitizedKey;
}
