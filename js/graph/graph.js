//// Node class
//var Node = function(tile) {
//    //this.type = 'land';
//    this.key = tile.id;
//    this.value = tile;
//    //this.keyTile = null;
//    this.edges = [];  
//    this.visited = false;
//    this.parent = null;
//}
//
//Node.prototype.addEdge = function(uNode) {
//    this.edges.push(uNode);
//}
//
//Node.prototype.removeEdge = function(uNode) {
//    var uId = uNode.id
//    for (let i = 0; i < this.edges.length; i++) {
//        if (this.edges[i].id === uId) {
//            this.edges.splice(i, 1)
//        }
//    }
//}
//
//
//Node.prototype.edges = function() {
//    return this.edges;   
//}

//
//// Edge Class
//var Edge = function(v, u, weight=1) {
//    this.v = v;
//    this.u = u;
//    this.weight = weight;
//};
//
//Edge.prototype.from = function() {
//    return this.v;
//};
//
//Edge.prototype.to = function() {
//    return this.u;
//};
//
//
//// Graph class
//var Graph = function() {
//    this.adj = {};    
//};
//
//
//Graph.prototype.addNode = function(v) {
//    if (!this.adj.hasOwnProperty(v)) {
//        this.adj[v] = [];
//    }
//};
//
//Graph.prototype.hasNode = function(v) {
//    return this.adj.hasOwnProperty(v);
//};
//
//
//Graph.prototype.addEdge = function(v, u, weight) {
//    
//    // Create nodes if necessary
//    this.addNode(v);
//    this.addNode(u);
//    
//    // Extract adjacent list
//    var vAdj = this.getAdj(v);
//    //var uEdges = this.getEdges(u);
//    
//    // Add node u to edge list of v
//    var edge = this.getEdge(v, u);
//    if (edge) {
//        edge.weight = weight;
//    }
//    else {
//        edge = new Edge(v, u, weight);
//        vAdj.push(edge);
//    };
//    
//};
//
//Graph.prototype.getNodes = function() {
//    return this.adj;
//};
//
//
//Graph.prototype.getAdj = function(v) {
//    if (this.adj.hasOwnProperty(v)) {
//        return this.adj[v];
//    }
//    
//    return [];    
//};
//
//
//Graph.prototype.removeEdge = function(v, u) {
//    
//    // Get adj list
//    var vEdges = this.getAdj(v);
//    
//    
//    for (var i = 0; i < vEdges.length; i++) {
//        let edge = vEdges[i];
//        if (edge.from() === v && edge.to() === u) {
//            vEdges.splice(i, 1);
//        }
//    }
//    
//};
//
//// Return edge, if there is one, or null otherwise
//Graph.prototype.getEdge = function(v, u) {
//    
//    // Extract edge list
//    var vEdges = this.getAdj(v);
//    
//    for (let edge of vEdges) {
//        if (edge.from() === v && edge.to() === u) {
//            return edge;
//        }
//    }
//    
//    return null;
//    
//};

// Graph class
var Graph = function() {
    this.adj = {};    
};


Graph.prototype.addNode = function(v) {
    if (!this.adj.hasOwnProperty(v)) {
        this.adj[v] = [];
    }
};

Graph.prototype.hasNode = function(v) {
    return this.adj.hasOwnProperty(v);
};


Graph.prototype.addEdge = function(v, u) {
    
    // Create nodes if necessary
    this.addNode(v);
    this.addNode(u);
    
    // Extract edge list
    var vNeighbors = this.getNeighbors(v);
    //var uEdges = this.getEdges(u);
    
    // Add node u to edge list of v
    if (vNeighbors.indexOf(u) === -1) {
        vNeighbors.push(u);
    }
    
};

Graph.prototype.getNodes = function() {
    return this.adj;
};

Graph.prototype.getNeighbors = function(v) {
    if (this.adj.hasOwnProperty(v)) {
        return this.adj[v];
    }
    
    return null;    
};


Graph.prototype.removeEdge = function(v, u) {
    
    // Get edge list
    var vNeighbors = this.getNeighbors(v);
    //var uEdges = this.getEdges(u);
    
    // Add node u to edge list of v
    var index = vNeighbors.indexOf(u);
    if (index !== -1) {
        vNeighbors.splice(index, 1);
    }
    
};

Graph.prototype.hasEdge = function(v, u) {
    
    // Extract edge list
    var vEdges = this.getNeighbors(v);
    
    if (vEdges.indexOf(u) === -1) {
        return false;
    }
    return true;
    
};