import { uniq, keyBy } from 'lodash';

import {
    FUNCTION_PROPERTIES,
    RequestFilterRuleLocator
} from '../compiler/protocol';

import Test from '../../api/structure/test';
import Fixture from '../../api/structure/fixture';
import TestFile from '../../api/structure/test-file';
import UnitType from '../../api/structure/unit-type';
import { RequestInfo } from 'testcafe-hammerhead';


const RECURSIVE_PROPERTIES = ['testFile', 'fixture', 'currentFixture', 'collectedTests'] as const;

interface FunctionMapper {
    (id: string, functionName: typeof FUNCTION_PROPERTIES[number]): Function;
}

interface RequestFilterRuleMapper {
    (ruleLocator: RequestFilterRuleLocator): (requestInfo: RequestInfo) => Promise<boolean>;
}

interface MapperArguments<T, P> {
    object: T;
    property: P;
    item: any;
}

interface Mapper<T, P> {
    ({ item, property, object }: MapperArguments<T, P>): any;
}

export type Unit = Test | Fixture | TestFile;

export interface Units {
    [id: string]: Unit;
}

function isProperty<T extends object> (object: T, property: string): property is Extract<keyof T, string> {
    return object.hasOwnProperty(property);
}

export function isTest (value: Unit): value is Test {
    return value.unitType === UnitType.test;
}

export function isFixture (value: Unit): value is Fixture {
    return value.unitType === UnitType.fixture;
}

function mapProperties<T extends Readonly<object>, P extends Readonly<string[]>> (object: T, properties: P, mapper: Mapper<T, P[number]>): void {
    for (const property of properties) {
        if (!isProperty(object, property))
            continue;

        const value = object[property];

        if (Array.isArray(value))
            object[property] = value.map(item => mapper({ item, property, object })) as any;
        else
            object[property] = mapper({ item: object[property], property, object });
    }
}

function replaceFunctionProperties (unit: Unit): void {
    mapProperties(unit, FUNCTION_PROPERTIES, ({ item }) => !!item);
}

function restoreFunctionProperties (unit: Unit, mapper: FunctionMapper): void {
    mapProperties(unit, FUNCTION_PROPERTIES, ({ item, object, property }) => item ? mapper(object.id, property) : item);
}

function flattenRecursiveProperties (unit: Unit): void {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => item.id);
}

function restoreRecursiveProperties (unit: Unit, units: Units): void {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => units[item]);
}

function restorePredicateInRequestFilterRules (test: Test, mapper: RequestFilterRuleMapper): void {
    test.requestHooks.forEach(hook => {
        for (let i = 0; i < hook._requestFilterRules.length; i++) {
            const targetRule = hook._requestFilterRules[i];

            if (!targetRule.isPredicate)
                continue;

            targetRule.options = mapper({
                testId: test.id,
                hookId: hook.id,
                ruleId: targetRule.id
            });
        }
    });
}

export function flatten (tests: Test[]): Units {
    const testFiles = uniq(tests.map(test => test.testFile));
    const fixtures  = uniq(tests.map(test => test.fixture));

    return keyBy([...tests, ...fixtures, ...testFiles], unit => unit.id);
}

export function serialize (units: Units): Units {
    const result: Units = {};

    for (const unit of Object.values(units)) {
        // @ts-ignore
        const copy: Unit = { ...unit };

        replaceFunctionProperties(copy);
        flattenRecursiveProperties(copy);

        result[copy.id] = copy;
    }

    return result;
}

export function restore (units: Units, testFunctionMapper: FunctionMapper, ruleMapper: RequestFilterRuleMapper): Test[] {
    const list = Object.values(units);

    const result: Test[] = [];

    for (const unit of list) {
        restoreRecursiveProperties(unit, units);
        restoreFunctionProperties(unit, testFunctionMapper);

        if (isTest(unit)) {
            restorePredicateInRequestFilterRules(unit, ruleMapper);

            result.push(unit);
        }
    }

    return result;
}
