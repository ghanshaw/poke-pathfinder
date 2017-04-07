pokemonApp.controller('mainController', function($scope, $log, pokeMap) { 
    
    var map = pokeMap.map;

    /********* -- Turn Layers on and off -- ************/
    
    $scope.layer = {
        click: 'bitmap',
        hover: null,
    };
    
    // Toggle Graphic layer on/off
    $scope.enterGraphicLayer = function() { $scope.layer.hover = 'graphic'; }
    
    $scope.leaveGraphicLayer = function() { $scope.layer.hover = null; }
    
    $scope.clickGraphicLayer = function() { $scope.layer.click = 'graphic'; }
    
    // Toggle Bitmap layer on/off
    $scope.enterBitmapLayer = function() { $scope.layer.hover = 'bitmap'; }
    
    $scope.leaveBitmapLayer = function() { $scope.layer.hover = null; }
    
    $scope.clickBitmapLayer = function() { $scope.layer.click = 'bitmap'; }
    
    // Update active view as necessary
    $scope.$watch('layer', function(newValue, oldValue) { $scope.updateCanvas(); }, true);
    
    
    /********* -- Turn Rows/Columns on and off -- ************/
    
    // Toggle rows/cols
    $scope.rowscols = {
        click: false,
        hover: false,
    };
    
    $scope.enterRowsCols = function() { $scope.rowscols.hover = true; }
    
    $scope.leaveRowsCols = function() { $scope.rowscols.hover = false; }
    
    $scope.clickRowsCols = function() { $scope.rowscols.click = !$scope.rowscols.click; }
    
    
    // Update active view as necessary
    $scope.$watch('rowscols', function(newValue, oldValue) {
        $scope.updateCanvas();
    }, true);
    
    
    $scope.updateCanvas = function() {
        
        
        // Turn Graphic/Bitmap layers on/off based on variables
        var layer = $scope.layer;
        
        if (layer.hover) {
            if (layer.hover === 'bitmap') {
                map.drawBitmapLayers();
            } 
            else {
                map.drawGraphicLayers();
            }
        }
        else {
            if (layer.click === 'bitmap') {
                map.drawBitmapLayers();
            }
            else {
                map.drawGraphicLayers();
            }
        }

        // Turn rows/cols on/off
        var rowscols = $scope.rowscols;
        
        if (rowscols.hover) {
            map.drawGraphicRowsCols();   
        }
        else if (rowscols.click) {
            map.drawGraphicRowsCols();
        }
        
        $log.log($scope);
    }
    
});

pokemonApp.controller('oldMainController', function($scope, $log, pokeMap, pokeGraph, pokeGame) {
    

    
    
    $scope.onGridView = function() {
        $scope.gridview = false;        
    }
    
    
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

pokemonApp.controller('gameboyController', function($scope, $log, pokeGraph, pokeGame) {
    
    //var gameboyCanvas = $('canvas#gameboy');
//    
//    var gbCanvas = document.createElement('canvas');
//    var gbCtx = gbCanvas.getContext('2d');
//    
//    gbCtx.webkitImageSmoothingEnabled = false;
//    gbCtx.mozImageSmoothingEnabled = false;
//    gbCtx.imageSmoothingEnabled = false; 
//    
//    gbCanvas.width = 500;
//    gbCanvas.rows = 10;
//    gbCanvas.cols = 15;
//    
//    gbCanvas.tileWidth = gbCanvas.width / gbCanvas.cols;
//    gbCanvas.height = gbCanvas.tileWidth * gbCanvas.rows;
//    
//    var map = pokeGraph.floor;
//    
//    
//    var sprite = map.sprite;
//    
//    var sourceWidth = gbCanvas.cols * map.tile_size;
//    var sourceHeight = gbCanvas.rows * map.tile_size;
//    
//    var origin = {
//        x: 0,
//        y: 0
//    }
//    
//    
//    //gameboyContext.drawImage(map.canvas, sx, sy, sourceWidth, sourceHeight, origin.x, origin.y, gbCanvas.width, gbCanvas.height);
//    //gameboyContext.drawImage(map.canvas, sx, sy, sourceWidth, sourceHeight, 0, 0, gameboyCanvas.width, gameboyCanvas.height);
//    //gameboyContext.drawImage(map.canvas, sx, sy, sourceWidth, sourceHeight, 0, 0, gameboyCanvas.width, gameboyCanvas.height); 
//    
//    pokeGame.updateGameboy = function() {
//        
//        var sx = (sprite.x + (map.tile_size/2) - sourceWidth/2);
//        var sy = (sprite.y + (map.tile_size/2) - sourceHeight/2);
//    
//        gbCtx.drawImage(map.canvas, sx, sy, sourceWidth, sourceHeight, origin.x, origin.y, gbCanvas.width, gbCanvas.height);
//
//        pokeGame.gameboy = {};
//        pokeGame.gameboy.ctx = gbCtx;
//        pokeGame.gameboy.canvas = gbCanvas;
//
//        var gameboyCanvas = document.getElementById('gameboy');
//        var gameboyContext = gameboyCanvas.getContext('2d');
//        gameboyCanvas.height = gbCanvas.height;
//        gameboyCanvas.width = gbCanvas.width;
//        
//        gameboyContext.webkitImageSmoothingEnabled = false;
//        gameboyContext.mozImageSmoothingEnabled = false;
//        gameboyContext.imageSmoothingEnabled = false; 
//
//        gameboyContext.fillStyle = 'blue';
//        gameboyContext.fillRect(0, 0, gameboyCanvas.width, gameboyCanvas.height);
//        gameboyContext.drawImage(map.canvas, sx, sy, sourceWidth, sourceHeight, 0, 0, gameboyCanvas.width, gameboyCanvas.height); 
//        //gameboyContext.drawImage(map.tileRockBackground, sx, sy, sourceWidth, sourceHeight, 0, 0, gameboyCanvas.width, gameboyCanvas.height); 
//    }
//    
//    pokeGame.updateGameboy();
//    //console.log(pokeGame);
//        
   //    $scope.toggleGraphicLayers = function() {
//       
//        if ($scope.currentView !== 'graphic') {
//            $scope.prevView = 'graphic';  
//            $scope.currentView = 'graphic';
//        } else {
//            $scope.prevView = 'bitmap';
//            $scope.currentView = 'bitmap';
//        }
//        
//    } 
    
});