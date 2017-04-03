function bfs(graph, source, target) {
    
    source = source.toString();
    target = target.toString();
    
    var q = [];
    
    sNode = graph.getNode(source);
    sNode.visited = true;
    
    q.push(sNode);    
    
    while (q) {

        vNode = q.shift();
        if (vNode.id === target) {
            console.log("FOUND!");
            return;
        }

        for (let edge of vNode.edges) {
            uNode = edge;

            if (!edge.visited) {
                edge.visited = true;
                edge.parent = vNode;
                q.push(edge);  
            }
        }
    }        
}
    
    
    