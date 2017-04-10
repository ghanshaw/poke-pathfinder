pokemonApp.controller('mainController', function($scope, $log, pokeMap, pokeGame) { 
    
    
    var map = pokeMap.map;
    var game = pokeGame.game;
    
    //map.sprite.MOVE_STATE = 'ON';
    //map.sprite.DIRECTION = 'LEFT';

    /********* -- Change Game Direction -- **********/ 
    
    $scope.cancelDirection = function(event) {
        var keyCode = event.keyCode;
        if (game.keyCode === keyCode) {
            $log.log('no longer pressing down');
            $log.log(event);        
            game.DIRECTION = null;
        }
    };
    
    
    $scope.changeDirection = function(event) {
        $log.log(event);      
        var keyCode = event.keyCode;
        game.keyCode = keyCode;
        
        switch(keyCode) {
            case 37:
                // Left arrow
                $log.log('left arrow');
                event.preventDefault();
                game.DIRECTION = 'LEFT';
                
                //map.moveSprite('left');
                break;
            case 38:
                // Up arrow
                $log.log('up arrow');
                event.preventDefault();
                game.DIRECTION = 'UP';
                //map.moveSprite('up');
                
                break;
            case 39:
                // Right arrow
                $log.log('right arrow');
                event.preventDefault();
                game.DIRECTION = 'RIGHT';
                //map.moveSprite('right');
                break;
                
            case 40:
                // Down arrow
                $log.log('down arrow');
                event.preventDefault();
                game.DIRECTION = 'DOWN';
                //map.moveSprite('down');
                break;
                      }
        
        //$scope.spriteTile = map.sprite.tile;
        

    };
    
    

    
    $scope.$watch('spriteTile', function(oldValue, newValue) {
        //$scope.updateCanvas();
    });
    
    $scope.updateCanvas = function() {
        
        // Redraw sprite at current location
        //map.drawSprite();
        
        $log.log($scope);
    };
    
    $scope.highlightTile = function($event) {
        
        var layerX = $event.layerX;
        var layerY = $event.layerY;
        
        var targetCanvas = event.target.id;
        
        map.highlightTile(layerX, layerY, targetCanvas);
                
    };
    
    $scope.selectTile = function($event) {
        
        var layerX = $event.layerX;
        var layerY = $event.layerY;
        
        var targetCanvas = event.target.id;
        
        
        
        if ($scope.game_mode === 'selectingStartTile') {
        
            //$scope.startTile =
            map.moveSprite(layerX, layerY, targetCanvas);
            
            var startTile = tiles.options[0];
            
            
        }
        
        else if ($scope.game_mode === 'selectingEndTile') {
         
            map.moveTarget(layerX, layerY, targetCanvas);
            var endTile = tiles.options[4];
            
        }
        
        
    }
    
});


pokemonApp.controller('userController', function($scope, $log, pokeMap) { 
   
    var map = pokeMap.map;
    
    
    /********* -- Select Algorithm -- ************/
    
    
    $scope.algorithms = {
        options: [
            {
                id: 0,
                label: 'Breadth-first search'
            },
            {
                id: 1,
                label: 'Depth-first search'
            },
            {   
                id: 2,
                label: 'Dijkstra\'s'
            },
            {
                id: 3,
                label: 'A*'
            }
        ],
        selected: { id: 0, label: 'Breadth-first search' }
    }
    
    
    /********* -- Select Starting and Stopping Tiles -- ************/
    
    $scope.tiles = {
        options: [
            {
                id: 0,
                label: 'Current Tile'
            },
            {
                id: 1,
                label: 'Entrance'
            },
            {   
                id: 2,
                label: 'Mewtwo'
            },
            {
                id: 3,
                label: 'Random Tile'
            },
            {
                id: 4,
                label: 'User-selected Tile'
            }
            
        ],
        startTile: { id: 0, label: 'Current Tile' },
        endTile: { id: 2, label: 'Mewtwo' }
    };
        
    
    /********* -- Turn Layers on and off -- ************/
    
    
    $scope.layer = {
        click: 'bitmap',
        hover: null
    };
    
    // Toggle Graphic layer on/off
    $scope.enterGraphicLayer = function() { $scope.layer.hover = 'graphic'; };
    
    $scope.leaveGraphicLayer = function() { $scope.layer.hover = null; };
    
    $scope.clickGraphicLayer = function() { $scope.layer.click = 'graphic'; };
    
    // Toggle Bitmap layer on/off
    $scope.enterBitmapLayer = function() { $scope.layer.hover = 'bitmap'; };
    
    $scope.leaveBitmapLayer = function() { $scope.layer.hover = null; };
    
    $scope.clickBitmapLayer = function() { $scope.layer.click = 'bitmap'; };
    
    // Update active view as necessary
    $scope.$watch('layer', function(newValue, oldValue) { $scope.updateCanvas(); }, true);
    
    
    /********* -- Turn Rows/Columns on and off -- ************/
    
    
    // Toggle rows/cols
    $scope.rowscols = {
        click: false,
        hover: false,
    };
    
    $scope.enterRowsCols = function() { $scope.rowscols.hover = true; };
    
    $scope.leaveRowsCols = function() { $scope.rowscols.hover = false; };
    
    $scope.clickRowsCols = function() { $scope.rowscols.click = !$scope.rowscols.click; };
    
    
    // Update active view as necessary
    $scope.$watch('rowscols', function(newValue, oldValue) {
        $scope.updateCanvas();
    }, true);
    
    
    $scope.updateCanvas = function() {
        
        
        // Turn Graphic/Bitmap layers on/off based on variables
        var layer = $scope.layer;
        
        if (layer.hover) {
            if (layer.hover === 'bitmap') {
                map.LAYER_STATE = "BITMAP";
                //map.drawBitmapLayers();
            } 
            else {
                map.LAYER_STATE = "GRAPHIC";
                //map.drawGraphicLayers();
            }
        }
        else {
            if (layer.click === 'bitmap') {
                map.LAYER_STATE = "BITMAP";
                //map.drawBitmapLayers();
            }
            else {
                map.LAYER_STATE = "GRAPHIC";
                //map.drawGraphicLayers();
            }
        }

        // Turn rows/cols on/off
        var rowscols = $scope.rowscols;
        
        if (rowscols.hover) {
            map.ROWSCOLS_STATE = 'ON';
            //map.drawGraphicRowsCols();   
        }
        else if (rowscols.click) {
            map.ROWSCOLS_STATE = 'ON';
            //map.drawGraphicRowsCols();
        } else {
            map.ROWSCOLS_STATE = 'OFF';       
        }
        
        $log.log($scope);
    };
    
    
});

/*
 
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

*/