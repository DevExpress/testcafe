import nanoid from 'nanoid';
import { uniq } from 'lodash';
import { TEST_FUNCTION_PROPERTIES } from './protocol';

import { Fixture, Test, TestFile } from '../../api/structure/interfaces';

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

interface TestData {
    tests: Test[];
    fixtures: Fixture[];
    testFiles: TestFile[];
}

interface ExtendedProperties {
    id: string;
    group: keyof TestData;
}

interface ExtendedTest extends Test, ExtendedProperties {
    fixture: ExtendedFixture;
    testFile: ExtendedTestFile;
}

interface ExtendedFixture extends Fixture, ExtendedProperties {
    testFile: ExtendedTestFile;
}

interface ExtendedTestFile extends TestFile, ExtendedProperties {
    collectedTests: ExtendedTest[];
    currentFixture: ExtendedFixture;
}

export type Unit = ExtendedTest | ExtendedFixture | ExtendedTestFile;

export interface Units {
    [id: string]: Unit;
}

function isProperty<T extends object> (object: T, property: string): property is Extract<keyof T, string> {
    return object.hasOwnProperty(property);
}

export function isTest (value: ExtendedProperties): value is ExtendedTest {
    return value.group === 'tests';
}

export function isFixture (value: ExtendedProperties): value is ExtendedFixture {
    return value.group === 'fixtures';
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
    const testData  = { tests, testFiles, fixtures };
    const units: Units = {};

    for (const group in testData) {
        if (!isProperty(testData, group))
            continue;

        for (const unit of testData[group]) {
            const extendedProperties = {
                id:    nanoid(),
                group: group
            };

            units[extendedProperties.id] = Object.assign(unit, extendedProperties) as Unit;
        }
    }

    return units;
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
