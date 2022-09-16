//NOTE: This is a service field for TestCafe Studio.
//It is used during the test creation phase and does not affect the execution of the command.

const studioRemoveStrategy = () => true;
const selectorRemoveStrategy = value => value === null;

const valuesRemoveStrategies = {
    'selector': selectorRemoveStrategy,
    'studio':   studioRemoveStrategy,
};

export default function (commandObj) {
    for (const key in commandObj) {
        if (!(key in valuesRemoveStrategies))
            continue;

        const removeStrategy = valuesRemoveStrategies[key];

        if (removeStrategy(commandObj[key]))
            delete commandObj[key];
    }
}
