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

// Graph class
var Graph = function() {
    this.adj = {};    
}


Graph.prototype.addNode = function(v) {
    if (!this.adj.hasOwnProperty(v)) {
        this.adj[v] = [];
    }
}

Graph.prototype.hasNode = function(v) {
    return this.adj.hasOwnProperty(v);
}


Graph.prototype.addEdge = function(v, u) {
    
    // Create nodes if necessary
    this.addNode(v);
    this.addNode(u);
    
    // Extract edge list
    var vEdges = this.getEdges(v);
    //var uEdges = this.getEdges(u);
    
    // Add node u to edge list of v
    if (vEdges.indexOf(u) == -1) {
        vEdges.push(u);
    }
    
}

Graph.prototype.getNodes = function() {
    return this.adj;
}

Graph.prototype.getEdges = function(v) {
    if (this.adj.hasOwnProperty(v)) {
        return this.adj[v];
    }
    
    return null;    
}


Graph.prototype.removeEdge = function(v, u) {
    
    // Get edge list
    var vEdges = this.getEdges(v);
    //var uEdges = this.getEdges(u);
    
    // Add node u to edge list of v
    var index = vEdges.indexOf(u);
    if (index !== -1) {
        vEdges.splice(index, 1);
    }
    
}

Graph.prototype.hasEdge = function(v, u) {
    
    // Extract edge list
    var vEdges = this.getEdges(v)
    
    if (vEdges.indexOf(u) === -1) {
        return false;
    }
    return true;
    
}