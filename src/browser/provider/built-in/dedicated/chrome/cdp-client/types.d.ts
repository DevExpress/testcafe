import Protocol from 'devtools-protocol';
import Node = Protocol.DOM.Node;
import Dimensions from '../../../../../../shared/utils/values/dimensions';
import { BoundaryValuesData } from '../../../../../../shared/utils/values/boundary-values';

export type ServerNode = Node & { objectId: string };

export interface PositionDimensions extends Dimensions {
    paddings: BoundaryValuesData;
}
