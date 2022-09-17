// NOTE: TestCafe Studio adds additional fields to the command object in RAW tests.
// They do not affect the execution of the command. Therefore, we should remove them before validation.
// We should change this mechanism in TestCafe Studio in the future to not add these properties to RAW tests.

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
