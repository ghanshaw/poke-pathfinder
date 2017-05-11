// Graph construction
var Graph = function() {
    this.adj = {};    
};

// Add node to graph
Graph.prototype.addNode = function(v) {
    if (!this.adj.hasOwnProperty(v)) {
        this.adj[v] = [];
    }
};

// Indicate if graph hasnode
Graph.prototype.hasNode = function(v) {
    return this.adj.hasOwnProperty(v);
};

// Creat an edge between two nodes
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

// Get list of all nodes
Graph.prototype.getNodes = function() {
    return this.adj;
};

// Get list of node's neighbors 
Graph.prototype.getNeighbors = function(v) {
    if (this.adj.hasOwnProperty(v)) {
        return this.adj[v];
    }
    
    return null;    
};

// Remove an edge between two nodes
Graph.prototype.removeEdge = function(v, u) {
    
    // Get edge list
    var vNeighbors = this.getNeighbors(v);
    
    // Add node u to edge list of v
    var index = vNeighbors.indexOf(u);
    if (index !== -1) {
        vNeighbors.splice(index, 1);
    }
    
};

// Indicate if edge exists between two nodes
Graph.prototype.hasEdge = function(v, u) {
    
    // Extract edge list
    var vEdges = this.getNeighbors(v);
    
    if (vEdges.indexOf(u) === -1) {
        return false;
    }
    return true;
    
};