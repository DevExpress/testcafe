import { ClientFunction } from 'testcafe';

fixture `Selector Inspector`
    .clientScripts `../utils/selector-inspector.js`
    .page `http://localhost:3000/fixtures/ui/pages/example.html`;

test('Show panel', async t => {
    await ClientFunction(() => {
        window['%testCafeDriverInstance%'].selectorInspectorPanel.show = () => window.resumeTest();
    })();

    await t.debug();
});

test('Hide TestCafe element while picking', async t => {
    await ClientFunction(() => {
        const {
            startPicking,
            getShadowUIElements,
            canBeShownInPicking,
            isVisible,
            resumeTest,
        } = window;

        startPicking().then(() => {
            for (const child of getShadowUIElements()) {
                if (!canBeShownInPicking(child) && isVisible(child))
                    return;
            }

            resumeTest();
        });
    })();

    await t.debug();
});

test('Generate selector', async t => {
    await ClientFunction(() => {
        const {
            startPicking,
            pickElement,
            getSelectorInputValue,
            resumeTest,
        } = window;

        startPicking()
            .then(() => {
                const target = document.querySelector('div.column:nth-child(2) > fieldset:nth-child(2) > legend:nth-child(1)');

                pickElement(target);

                return getSelectorInputValue();
            })
            .then(value => {
                if (value === "Selector('#main-form legend').withText('Which TestCafe interface do you use:')")
                    resumeTest();
            });
    })();

    await t.debug();
});

test('Fill the selectors list', async t => {
    await ClientFunction(() => {
        const {
            startPicking,
            pickElement,
            expandSelectorsList,
            getSelectorsListValues,
            resumeTest,
        } = window;

        startPicking()
            .then(() => {
                const target = document.querySelector('div');

                pickElement(target);

                return expandSelectorsList();
            })
            .then(() => {
                return getSelectorsListValues();
            })
            .then(selectorsValues => {
                const isValidTestCafeSelectors = selectorsValues.every(value => value.startsWith('Selector('));

                if (selectorsValues.length > 0 && isValidTestCafeSelectors)
                    resumeTest();
            });
    })();

    await t.debug();
});

test('Indicate matching', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector('div')
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'Found: 19')
                    resumeTest();
            });
    })();

    await t.debug();
});

test('Indicate invalid', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector('Selector(/.%')
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'Invalid Selector')
                    resumeTest();
            });
    })();

    await t.debug();
});

test('Indicate no matching', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector('div > div > input[id="not-valid-id"]')
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'No Matching Elements')
                    resumeTest();
            });
    })();

    await t.debug();
});

test('Highlight elements', async t => {
    await ClientFunction(() => {
        const {
            typeSelector,
            getElementFrames,
            isElementsRectsEql,
            resumeTest,
        } = window;

        const selector = 'input[id]';
        const elements = document.querySelectorAll(selector);

        if (!elements || elements.length < 2)
            return;

        typeSelector(selector)
            .then(() => {
                return getElementFrames();
            })
            .then(elementFrames => {
                for (let i = 0; i < elements.length; i++) {
                    if (!isElementsRectsEql(elements[i], elementFrames[i]))
                        return;
                }

                resumeTest();
            });
    })();

    await t.debug();
});

test('Select selector', async t => {
    await ClientFunction(() => {
        const {
            startPicking,
            pickElement,
            getGeneratedSelectors,
            selectSelectorFromList,
            getSelectorInputValue,
            resumeTest,
        } = window;

        startPicking()
            .then(() => {
                const target = document.querySelector('#main-form > div > div.row > div.column.col-1 > fieldset:nth-child(2) > p:nth-child(3)');

                pickElement(target);

                const selectors = getGeneratedSelectors();

                let promise = Promise.resolve();

                for (let i = 0; i < selectors.length; i++) {
                    promise = promise
                        .then(() => {
                            return selectSelectorFromList(i);
                        })
                        .then(() => {
                            return getSelectorInputValue();
                        })
                        .then(selectorValue => {
                            if (selectorValue !== selectors[i])
                                throw 'Selector values do not match';
                        });
                }

                return promise;
            })
            .then(() => {
                resumeTest();
            });
    })();

    await t.debug();
});

test('Copy selector', async t => {
    await ClientFunction(() => {
        const { typeSelector, copySelector, resumeTest } = window;

        const selector = "Selector('div').nth(2).find('input')";

        typeSelector(selector)
            .then(() => {
                return copySelector();
            })
            .then(copiedSelector => {
                if (copiedSelector === selector)
                    resumeTest();
            });
    })();

    await t.debug();
});
