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

import { EdgeWeightedDigraph, DirectedEdge } from './edge_weighted_digraph';
import Topological = require('./topological');

/**
  *  The LongestPathTree represents a data type for solving the
  *  single-source longest paths problem in edge-weighted directed
  *  acyclic graphs (DAGs). The edge weights can be positive, negative, or zero.
  *  This implementation uses a topological-sort based algorithm.
  *  the distTo() and hasPathTo() methods take
  *  constant time and the pathTo() method takes time proportional to the
  *  number of edges in the longest path returned.
  */
class LongestPathTree {
    edgeTo: DirectedEdge[];
    distTo: number[];
    start: number;
    top: Topological;
    constructor(digraph: EdgeWeightedDigraph, start: number) {
        this.edgeTo = [];
        this.distTo = [];
        this.distTo[start] = 0.0;
        this.start = start;
        this.top = new Topological(digraph);
        for (const vertex of this.top.order()) {
            relaxVertex(digraph, vertex, this);
        }
    };

    relaxEdge(e: DirectedEdge) {
        var distTo = this.distTo,
        edgeTo = this.edgeTo;
        var v = e.from(), w = e.to();
        if (distTo[w] < distTo[v] + e.weight) {
            distTo[w] = distTo[v] + e.weight;
            edgeTo[w] = e;
        }
    };

    getDistTo(v: number) {
        return this.distTo[v];
    };

    hasPathTo(v: number) {
        return !!this.distTo[v];
    };

    pathTo(v: number) {
        if (!this.hasPathTo(v)) return [];
        var path = [];
        var edgeTo = this.edgeTo;
        for (var e = edgeTo[v]; !!e; e = edgeTo[e.from()]) {
            path.push(e.to());
        }
        path.push(this.start);
        return path.reverse();
    };
}

/**
 * relax a vertex v in the specified digraph g
 * @param the apecified digraph
 * @param v vertex to be relaxed
 */
function relaxVertex(digraph: EdgeWeightedDigraph, vertex: number, tree: LongestPathTree) {
    var distTo = tree.distTo;
    var edgeTo = tree.edgeTo;

    for (const edge of digraph.getAdj(vertex)) {
        var w = edge.to();
        distTo[w] = distTo[w] || 0.0;
        distTo[vertex] = distTo[vertex] || 0.0;
        if (distTo[w] < distTo[vertex] + edge.weight) {
            // in case of the result of 0.28+0.34 is 0.62000001
            distTo[w] = parseFloat((distTo[vertex] + edge.weight).toFixed(2));
            edgeTo[w] = edge;
        }
    }

}

export = LongestPathTree;
