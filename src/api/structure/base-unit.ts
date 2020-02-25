import { generateUniqueId } from 'testcafe-hammerhead';
import * as unitTypes from './unit-types';


type UnitTypes = typeof unitTypes;
type UnitType = UnitTypes[keyof UnitTypes];

const ID_LENGTH = 7;

export default class BaseUnit {
    public id: string;
    public unitTypeName: UnitType;

    public constructor (unitTypeName: UnitType) {
        this.id           = generateUniqueId(ID_LENGTH);
        this.unitTypeName = unitTypeName;
    }
}
