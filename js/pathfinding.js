var pathfinding = (function() {
    
    // Follow parent pointer to construct path
    function makePath(node) {
        
        var path = [];
        
        while (node) {
            path.unshift(node)
            node = node.parent;
        }
        
        return path;
            
    }
    
    
    // Run Breadth-First Search
    function bfs(graph, source, target) {

        source = source.toString();
        target = target.toString();

        var q = [];
        var visited = new Set();

        
        sNode = graph.getNode(source);
        sNode.parent = null;
        visited.add(sNode.id);

        q.push(sNode); 

        while (q) {

            vNode = q.shift();
            if (vNode.id === target) {
                console.log("FOUND!");
                var path = makePath(vNode);
                return path;
            }

            for (let edge of vNode.edges) {
                let uNode = edge;

                if (!visited.has(uNode.id)) {
                    visited.add(uNode.id);
                    uNode.parent = vNode;
                    q.push(uNode);  
                }
            }
        }    
    }
    
    
    var pathfinding = {};
    
    pathfinding.bfs = function(graph, source, target) {
        return bfs(graph, source, target);
    }
    
    return pathfinding
    
    
})();


    