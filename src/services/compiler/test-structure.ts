import { uniq, keyBy } from 'lodash';
import { TEST_FUNCTION_PROPERTIES } from './protocol';

import { Fixture, Test, TestFile } from '../../api/structure/interfaces';
import * as unitTypes from '../../api/structure/unit-types';


const RECURSIVE_PROPERTIES = ['testFile', 'fixture', 'currentFixture', 'collectedTests'] as const;

interface FunctionMapper {
    (id: string, functionName: typeof TEST_FUNCTION_PROPERTIES[number]): Function;
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
    return value.unitTypeName === unitTypes.TEST;
}

export function isFixture (value: Unit): value is Fixture {
    return value.unitTypeName === unitTypes.FIXTURE;
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

function replaceTestFunctions (unit: Unit): void {
    mapProperties(unit, TEST_FUNCTION_PROPERTIES, ({ item }) => !!item);
}

function restoreTestFunctions (unit: Unit, mapper: FunctionMapper): void {
    mapProperties(unit, TEST_FUNCTION_PROPERTIES, ({ item, object, property }) => item ? mapper(object.id, property) : item);
}

function flattenRecursiveProperties (unit: Unit): void {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => item.id);
}

function restoreRecursiveProperties (unit: Unit, units: Units): void {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => units[item]);
}

export function flatten (tests: Test[]): Units {
    const testFiles = uniq(tests.map(test => test.testFile));
    const fixtures  = uniq(tests.map(test => test.fixture));

    return keyBy([...tests, ...fixtures, ...testFiles], unit => unit.id);
}

export function serialize (units: Units): Units {
    const result: Units = {};

    for (const unit of Object.values(units)) {
        const copy: Unit = { ...unit };

        replaceTestFunctions(copy);
        flattenRecursiveProperties(copy);

        result[copy.id] = copy;
    }

    return result;
}

export function restore (units: Units, mapper: FunctionMapper): Test[] {
    const list = Object.values(units);

    const result: Test[] = [];

    for (const unit of list) {
        restoreRecursiveProperties(unit, units);
        restoreTestFunctions(unit, mapper);
    }

    for (const unit of list) {
        if (isTest(unit))
            result.push(unit);
    }

    return result;
}
