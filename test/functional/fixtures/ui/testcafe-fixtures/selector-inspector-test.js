import { ClientFunction } from 'testcafe';

fixture `Selector Inspector`
    .clientScripts `../utils/selector-inspector.js`
    .page `http://localhost:3000/fixtures/ui/pages/example.html`;

test('panel should be shown in debug mode', async t => {
    await ClientFunction(() => {
        window['%testCafeDriverInstance%'].selectorInspectorPanel.show = () => window.resumeTest();
    })();

    await t.debug();
});

test('should hide TestCafe elements while piking', async t => {
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

test('should generate valid selector', async t => {
    await ClientFunction(() => {
        const {
            startPicking,
            pickElement,
            getSelectorInputValue,
            resumeTest,
        } = window;

        startPicking()
            .then(() => {
                const target = document.querySelector('#container > div:nth-child(2)');

                pickElement(target);

                return getSelectorInputValue();
            })
            .then(value => {
                if (value === "Selector('#container div').withText('Another text')")
                    resumeTest();
            });
    })();

    await t.debug();
});

test('should fill the selectors list with the generated selectors', async t => {
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

test('should indicate the correct number of elements matching the css selector', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector('div')
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'Found: 4')
                    resumeTest();
            });
    })();

    await t.debug();
});

test('should indicate the correct number of elements matching the TestCafe selector', async t => {
    await ClientFunction(() => {
        const { typeSelector, getMatchIndicatorInnerText, resumeTest } = window;

        typeSelector("Selector('div')")
            .then(() => {
                return getMatchIndicatorInnerText();
            })
            .then(text => {
                if (text === 'Found: 4')
                    resumeTest();
            });
    })();

    await t.debug();
});

test('should indicate if the selector is invalid on input', async t => {
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

test('should indicate that no matches on input', async t => {
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

test('should highlight matches elements on input', async t => {
    await ClientFunction(() => {
        const {
            typeSelector,
            getElementFrames,
            isElementsRectsEql,
            resumeTest,
        } = window;

        const selector = 'input[id]';
        const elements = document.querySelectorAll(selector);

        if (!elements || elements.length !== 4)
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

test('should place a selector selected from the list in the input field', async t => {
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
                const target = document.querySelector('#main > p:nth-child(3)');

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

test('should copy selector', async t => {
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
