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

import util = require('util');
import Bag = require('./bag');

export class DirectedEdge {
    start: number;
    end: number;
    weight: number;
    constructor(start: number, end: number, weight: number) {
        this.start = start;
        this.end = end;
        this.weight = weight;
    }

    from() {
        return this.start;
    }

    to() {
        return this.end;
    }

    toString() {
        return util.format('%s -> %s, %s', this.start, this.end, this.weight);
    }
}

export class EdgeWeightedDigraph {
    edgesNum: number;
    adj: Bag<DirectedEdge>[];

    constructor() {
        this.edgesNum = 0;
        this.adj = []; // adjacency list
    }

    /**
     * the number of vertexs saved.
     */
    v() {
        return this.adj.length;
    };

    /**
     * the number of edges saved.
     */
    e() {
        return this.edgesNum;
    };

    add(start: number, end: number, weight: number) {
        this.addEdge(new DirectedEdge(start, end, weight));
    };

    private addEdge(e: DirectedEdge) {
        if(!this.adj[e.from()]) {
            this.adj[e.from()] = new Bag<DirectedEdge>();
        }
        this.adj[e.from()].add(e);
        this.edgesNum++;
    };

    /**
     * use callback on all edges from v.
     */
    getAdj(v: number) {
        if(!this.adj[v]) return [];
        return this.adj[v].unpack();
    };

    /**
     * use callback on all edges.
     */
    edges() {
        var adj = this.adj;
        var list = new Bag<DirectedEdge>();
        for(var i in adj) {
            for (const item of adj[i].unpack()) {
                list.add(item);
            }
        }
        return list.unpack();
    };

    toString() {
        return this.edges().map(edge => edge.toString()).join('\n');
    };
}
