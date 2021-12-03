import Protocol from 'devtools-protocol/types/protocol';
import Dimensions from '../../../../../../shared/utils/values/dimensions';
import { BoundaryValuesData } from '../../../../../../shared/utils/values/boundary-values';

export interface PositionDimensions extends Dimensions {
    paddings: BoundaryValuesData;
}

export type ClientObject = string | { result: Protocol.Runtime.RemoteObject };
