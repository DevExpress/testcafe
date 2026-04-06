const actions = { };

export function isInQueue (key) {
    return actions[key];
}

export function addToQueue (key, asyncAction) {
    const action = actions[key] || Promise.resolve();
    const nextAction = action.then(() => asyncAction());

    actions[key] = nextAction;

    nextAction.finally(() => {
        if (actions[key] === nextAction)
            delete actions[key];
    });

    return nextAction;
}
