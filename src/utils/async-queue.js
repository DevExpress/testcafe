const actions = { };

export function isInQueue (key) {
    return actions[key];
}

export function addToQueue (key, asyncAction) {
    const action = actions[key] || Promise.resolve();

    actions[key] = action.then(() => asyncAction());

    return actions[key];
}
