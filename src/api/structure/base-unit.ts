import { generateUniqueId } from 'testcafe-hammerhead';
import UnitType from './unit-type';

const ID_LENGTH = 7;

export default class BaseUnit {
    public id: string;
    public unitType: UnitType;

    public constructor (unitType: UnitType) {
        this.id       = generateUniqueId(ID_LENGTH);
        this.unitType = unitType;
    }
}
