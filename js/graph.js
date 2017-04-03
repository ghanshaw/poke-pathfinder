// Node class
var Node = function(id) {
    this.type = 'land';
    this.id = id.toString();
    this.cell = {
        row: id[0],
        col: id[1]
    };
    this.special = null;
    this.edges = [];  
    this.visited = false;
    this.parent = null;
}

Node.prototype.addEdge = function(uNode) {
    this.edges.push(uNode);
}

Node.prototype.removeEdge = function(uNode) {
    var uId = uNode.id
    for (let i = 0; i < this.edges.length; i++) {
        if (this.edges[i].id === uId) {
            this.edges.splice(i, 1)
        }
    }
}


Node.prototype.edges = function() {
    return this.edges;   
}

// Graph class
var Graph = function() {
    this.adj = {};    
}


Graph.prototype.addNode = function(v) {
    if (!this.adj.hasOwnProperty(v)) {
        this.adj[v] = new Node(v);
    }
}

Graph.prototype.getNode = function(v) {
    if (!this.adj.hasOwnProperty(v)) {
        this.addNode(v);        
    }
    
    return this.adj[v] 
}

Graph.prototype.addEdge = function(v, u) {
    
    var vNode = this.getNode(v);
    var uNode = this.getNode(u);
    
    vNode.addEdge(uNode);
       
}

Graph.prototype.removeEdge = function(v, u) {
    var vNode = this.getNode(v);
    var uNode = this.getNode(u);
    
    vNode.removeEdge(uNode);
    
}