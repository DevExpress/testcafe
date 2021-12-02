import Protocol from 'devtools-protocol';
import Node = Protocol.DOM.Node;

export type ServerNode = Node & { objectId: string };
