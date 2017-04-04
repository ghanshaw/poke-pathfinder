pokemonApp.controller('mainController', function($scope, $log, pokeGraph, pokeGame) {

    $scope.algorithms = {
        
        availableOptions: [
            {
              id: 1,
              name: 'Breadth-First Search',
            }, 
            {
              id: 2,
              name: 'Depth-First Search',
            }, 
            {
              id: 3,
              name: 'Dijkstra\'s',
            }, 
            {
              id: 4,
              name: 'A*',
            },
        ],
        
        selectedAlgo: { id: 1, name: 'Breadth-First Search' }  
    };
        
    $scope.keyTiles = {
        
        availableOptions: pokeGame.keyTiles,
        startTile: pokeGame.keyTiles[0],
        endTile: pokeGame.keyTiles[1]
        
    };
    
    $scope.findPath = function() {
        
        var graph = pokeGraph.graph;
        var algoId = $scope.algorithms.selectedAlgo.id;
        var source = $scope.keyTiles.startTile.tile;
        var target = $scope.keyTiles.endTile.tile;
        var path = null;
            
        switch(algoId) {
                
            case 1:
                path = pathfinding.bfs(graph, source, target);
                break;
            case 2:
                pathfinding.dfs(graph, source, target);
                break;
                
                }
        
        if (path) {
            pokeGame.drawPath(path);
            //setInterval(pokemonApp._1F.drawPath.bind(pokemonApp._1F, path), 10);
        }

        
    }
        
    
           
});