var pokemonApp = angular.module('pokemonApp', []);

pokemonApp.controller('mainController', function($scope, $log) {

    $scope.items = [{
      id: 1,
      label: 'Breadth First Search',
    }, {
      id: 2,
      label: 'Depth First Search',
    }, {
      id: 3,
      label: 'Dijkstra\'s',
    }, {
      id: 4,
      label: 'A*',
    }];
    
    $scope.targets = [{
        name: 'Entrance',
    },
    {
        name: 'Mewtwo',
    }]
       
           
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