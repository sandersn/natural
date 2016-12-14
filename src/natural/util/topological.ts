/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

import { EdgeWeightedDigraph, DirectedEdge } from "./edge_weighted_digraph";

/**
 * a topo sort for a digraph
 */
class Topological {
    isDag: boolean;
    sorted: any[];
    constructor(g: EdgeWeightedDigraph) {
        this.isDag = true;
        this.sorted = topoSort(uniqueVertexs(g.edges()), g.edges());
    }

    isDAG() {
        return this.isDag;
    };

    /**
     * get ordered vertexs of digraph
     */
    order() {
        return this.sorted.slice();
    };
}

function topoSort(vertexs: number[], edges: DirectedEdge[]) {
    var sorted: number[] = [];
    var cursor = vertexs.length;
    var visited: { [n: number]: boolean } = {};
    var i = cursor;
    while (i--) {
        if (!visited[i]) visit(vertexs[i], i, []);
    }

    return sorted.reverse();

    function visit(vertex: number, i: number, predecessors: number[]) {
        if(predecessors.indexOf(vertex) >= 0) {
            throw new Error('Cyclic dependency:' + JSON.stringify(vertex));
        }

        if(visited[i]) return;
        visited[i] = true;

        var outgoing = edges.filter(function(edge) {
            return edge.to() === vertex;
        });

        var preds: number[] = [];
        if(outgoing.length > 0) {
            preds = predecessors.concat(vertex);
        }
        var from;
        outgoing.forEach(function(edge) {
            from = edge.from();
            visit(from, vertexs.indexOf(from), preds);
        });

        sorted[--cursor] = vertex;
    };
};


function uniqueVertexs(edges: DirectedEdge[]) {
    var vertexs = [];
    var from, to;
    for (const edge of edges) {
        from = edge.from();
        to = edge.to();
        if (vertexs.indexOf(from) < 0) vertexs.push(from);
        if (vertexs.indexOf(to) < 0) vertexs.push(to);
    }
    return vertexs;
};

export = Topological;
