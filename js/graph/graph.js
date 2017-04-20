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


// Edge Class
var Edge = function(v, u, weight=1) {
    this.v = v;
    this.u = u;
    this.weight = weight;
};

Edge.prototype.from = function() {
    return this.v;
};

Edge.prototype.to = function() {
    return this.u;
};


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


Graph.prototype.addEdge = function(v, u, weight) {
    
    // Create nodes if necessary
    this.addNode(v);
    this.addNode(u);
    
    // Extract adjacent list
    var vAdj = this.getAdj(v);
    //var uEdges = this.getEdges(u);
    
    // Add node u to edge list of v
    var edge = this.getEdge(v, u);
    if (edge) {
        edge.weight = weight;
    }
    else {
        edge = new Edge(v, u, weight);
        vAdj.push(edge);
    };
    
};

Graph.prototype.getNodes = function() {
    return this.adj;
};


Graph.prototype.getAdj = function(v) {
    if (this.adj.hasOwnProperty(v)) {
        return this.adj[v];
    }
    
    return [];    
};


Graph.prototype.removeEdge = function(v, u) {
    
    // Get adj list
    var vEdges = this.getAdj(v);
    
    
    for (var i = 0; i < vEdges.length; i++) {
        let edge = vEdges[i];
        if (edge.from() === v && edge.to() === u) {
            vEdges.splice(i, 1);
        }
    }
    
};

// Return edge, if there is one, or null otherwise
Graph.prototype.getEdge = function(v, u) {
    
    // Extract edge list
    var vEdges = this.getAdj(v);
    
    for (let edge of vEdges) {
        if (edge.from() === v && edge.to() === u) {
            return edge;
        }
    }
    
    return null;
    
};




function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n], score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent))
        break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
};