var pokemonApp = angular.module('pokemonApp', []);

pokemonApp.controller('mainController', function($scope, $log) {

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
        
    
    $scope.targetTiles = {
        
        availableOptions: [
            {
                id: '1',
                name: 'Entrance',
            },
            {
                id: '2',
                name: 'Mewtwo',
            }
        ],
        
        startTile: { id: '1', name: 'Entrance' },
        endTile: { id: '2', name: 'Mewtwo' } 
        
    };
           
});


pokemonApp.service('graph', function() {
    
    
});



//    var water = {
//        0: [],
//        1: [],
//        2: [],
//        3: [],
//        4: [],
//        5: [],
//        6: [],
//        7: [],
//        8: [],
//        9: [],
//        10: [],
//        11: [],
//        12: [],
//        13: [],
//        14: [],
//        15: [],
//        16: [],
//        17: [],
//        18: [],
//        19: [],
//        20: [],
//    }