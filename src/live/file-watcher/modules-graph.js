import { Graph } from 'graphlib';

export default class ModulesGraph {
    constructor () {
        this.graph = new Graph();
    }

    _updateChildren (node, cache) {
        const cached = cache[node];

        if (!cached)
            return;

        const outEdges = this.graph.outEdges(node) || [];

        outEdges.forEach(edge => this.graph.removeEdge(edge.v, edge.w));

        const children = cached && cached.children.map(child => child.id);

        if (!children) return;

        children.filter(child => child.indexOf('node_modules') === -1)
            .forEach(child => {
                this.addNode(child, cache);
                this.graph.setEdge(node, child);
            });
    }

    addNode (node, cache) {
        if (this.graph.hasNode(node))
            return;

        const cached = cache[node];

        if (cached)
            this.graph.setNode(node);

        const parent = cached && cached.parent;

        if (parent && parent.id.indexOf('node_modules') < 0) {
            this.addNode(parent.id, cache);
            this.graph.setEdge(parent.id, node);
        }

        this._updateChildren(node, cache);
    }

    build (cache, nodes) {
        nodes.forEach(node => this.addNode(node, cache, true));
    }

    rebuildNode (cache, node) {
        this._updateChildren(node, cache);
    }

    clearParentsCache (cache, node) {
        if (!cache[node])
            return;

        cache[node] = null;

        const parentEdges = this.graph.inEdges(node);

        if (!parentEdges || !parentEdges.length)
            return;

        parentEdges
            .map(edge => edge.v)
            .forEach(parent => this.clearParentsCache(cache, parent));
    }
}
