pokemonApp.controller('indexController', function($scope, $log, $location, $window, pokeGame) {  
    
    $scope.panel = {
        open: false
    };
    
    $scope.about = {
        visible: false
    };
    
    $scope.includeDesktopTemplate = false;
    $scope.includeMobileTemplate = false; 
    
    
    $scope.breakpoints = {
        sm: 768,
        md: 992,
        lg: 1200
    };
    
    
    
    
    
    $scope.togglePanel = function() {
        
        var status = $scope.panel.open;
        $scope.panel.open = !status;
        
    };
    
    $scope.toggleAbout = function() {
        
        var status = $scope.about.visible;
        $scope.about.visible = !status;
        
        $('html, body').toggleClass('no-scroll');
        
    };
    
    //    $scope.sidePanelWidth = function() {
    //        var width = 
    //        return width;
    //    };
    //    
    $scope.cssSidePanel = function() {
        return { 
            'panel-open': $scope.panel.open,
            'panel-closed': !$scope.panel.open  
        };
    }; 
    
    $('.side-bar').toggleClass('console-open');
    $('.side-bar').toggleClass('console-closed'); 
    
    //$scope.view;
    var path = $location.path();
    if (path === '/') {
        $scope.view = 'gameboy';
    } else {
        $scope.view = 'monitor';
    }
    
    
    
    $scope.switchViews = function() {
        
        pokeGame.viewLoaded = false;
        
        console.log('switching views');
        $log.log($scope.view);
        
        if ($scope.view === 'gameboy') {
            $location.path('/');
            $scope.activeView = 'gameboy';
        } else {
            $location.path('/monitor/');
            $scope.activeView = 'monitor';
        }
        
        //$scope.activeView = 'monitor';
        
        $log.log($scope.activeView);
    };
    
    $scope.$watch('view', function(newValue, oldValue) {
        pokeGame.setView(newValue);        
    });
    
    var appWindow = angular.element($window);
    
    $scope.viewswitcher = {
        visible: true
    };
    
    appWindow.bind('resize', function () {
        
        $scope.view;
        var path = $location.path();
	
        var screenWidth = $window.innerWidth;
        
        if (screenWidth < $scope.breakpoints.sm) {
            $scope.hideMonitor = true;
            if ($scope.view !== 'gameboy') {
                $scope.view = 'gameboy';
                $scope.switchViews();
                $scope.$apply();  
            } 
            
            $scope.viewswitcher.visible = false;
        } else {
            $scope.viewswitcher.visible = true;
        }
        
    });
    
    
});

pokemonApp.controller('viewSwitcher', function($scope, $log, $location, pokeGame) {
    
    
    
});



pokemonApp.controller('monitorController', function($scope, $log, $window, pokeGame) { 
    
    
    var game = pokeGame.game;
    $scope.monitor = game.monitor;
    $scope.monitor.init();
    $scope.monitor.resize();
    
    var appWindow = angular.element($window);
    
    appWindow.bind('resize', function () {
	$scope.monitor.resize();
    });
    
    
    //    //game.initMonitor();
    //    game.monitor.initCanvas();
    //    game.monitor.createMonitorBackground();
    //    game.monitor.createGrid();
    //    game.monitor.drawMonitor();
    
    $scope.startDrag = function($event) {
        
        //alert('started dragging');
        
        game.startPlayerDrag($event);
        game.startPointMarkerDrag($event);
        
    };
    
    $scope.endDrag = function($event) {
        console.log("At first, pathfinder state was: " + game.pathfinder.PATH_STATE);
        
        console.log('finished dragging');
        game.endPlayerDrag();
        game.endPointMarkerDrag();
        
        console.log("Now it's: " + game.pathfinder.PATH_STATE);
        
    };
    
    
    $scope.movePointer = function(event) {
        
        game.setMonitorPointer(event);    
        console.log('hovering');        
    };
    
    $scope.clickPointer = function() { 
        console.log('I just clicked the monitor');
        game.CLICKED = true; 
    };     
    
    pokeGame.viewLoaded = true;
    
});


pokemonApp.controller('gameboyController', function($scope, $log, $window, $document, pokeGame) { 
    
    
    angular.element(document).ready(function () {
        
        var game = pokeGame.game;
        var gameboy = game.gameboy;
        
        gameboy.init();
        gameboy.resize();
        
        var appWindow = angular.element($window);
        
        appWindow.bind('resize', function () {
            console.log('resizing');
            gameboy.resize();
        });
        
        pokeGame.viewLoaded = true;
        
    });
    
    
    $scope.touched = false;
    
    $scope.touchStartDpad = function(direction) {
        console.log('touch me');
        $scope.touched = true;
        $scope.pressdpad(direction);
    };
    
    $scope.touchdEndDpad = function(direction) {
        console.log("don't touch me");
        $scope.touched = false;
        $scope.releasedpad(direction);
    };
    
    $scope.dpad = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    $scope.pressdpad = function(direction) {
        
        var dpad = $scope.dpad;
        
        if (direction === 'LEFT') {
            dpad.left = true;
            pokeGame.game.KEYPRESS = 'LEFT';
        }
        
        else if (direction === 'RIGHT') {
            dpad.right = true;
            pokeGame.game.KEYPRESS = 'RIGHT';
        }
        
        else if (direction === 'UP') {
            dpad.up = true;
            pokeGame.game.KEYPRESS = 'UP';
        }
        
        else if (direction === 'DOWN') {
            dpad.down = true;
            pokeGame.game.KEYPRESS = 'DOWN';
        }
        
        
        
        //        console.log('pressing dpad');
        //        $scope.dpad.down = true;
        
    };
    
    $scope.releasedpad = function(direction) {
        
        var dpad = $scope.dpad;
        
        if (direction === 'LEFT') {
            dpad.left = false;
        }
        
        else if (direction === 'RIGHT') {
            dpad.right = false;
        }
        else if (direction === 'UP') {
            dpad.up = false;
        }
        else if (direction === 'DOWN') {
            dpad.down = false;
        }
        
        pokeGame.game.KEYPRESS = null;
        
    };
    
    $scope.cssdpad = function(direction) {
        
        var dpad = $scope.dpad;
        
        var css = {
            'press-left': dpad.left,
            'press-right': dpad.right,
            'press-up': dpad.up,
            'press-down': dpad.down
        };
        
        return css;
    };
    
    $scope.ab = {
        a: false,
        b: false
    };
    
    $scope.touchStartAB = function(button) {
        $scope.touched = true;
        $scope.pressAB(button);
    };
    
    $scope.touchEndAB = function(button) {
        $scope.touched = false;
        $scope.releaseAB(button);
    };
    
    
    $scope.pressAB = function(button) {
        if (button === 'A') {
            //game.setSpeed('')
            $scope.ab.a = true;
        }
        
        if (button === 'B') {
            //game.setSpeed('')
            $scope.ab.b = true;
        }
    };
    
    $scope.releaseAB = function(button) {
        if (button === 'A') {
            //game.setSpeed('')
            $scope.ab.a = false;
        }
        
        if (button === 'B') {
            //game.setSpeed('')
            $scope.ab.b = false;
        }
    };
    
    
    
    
    
    
    //    
    //    
    //    
    //    // Controller (re-)initializes the canvas  
    //    gameboy.initCanvas();
    //    gameboy.createGameboyBackground();
    //    gameboy.createGrid();
    
});

pokemonApp.controller('aboutController', function($scope, $log, pokeGame) { 
    
    
    
});



pokemonApp.controller('userController', function($scope, $log, pokeGame) { 
    
    var game = pokeGame.game;
    $scope.game = game;
    
    
    $scope.debugClick = function() {
        
        game.map.addRemoveGaps(true);
        game.map.createMapLayers(game.graph);
        
    };
    
    $scope.debugClick2 = function() {
        
        game.map.addRemoveGaps(false);
        
    };
    
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
    };
    
    
    /********* -- Select Starting and Stopping Tiles -- ************/
    
    $scope.tiles = {
        options: [
            {
                id: 0,
                label: 'Current Player Tile'
            },
            {
                id: 1,
                label: 'Entrance',
                keyTile: 0
            },
            {   
                id: 2,
                label: 'Mewtwo',
                keyTile: 1
            },
            {
                id: 3,
                label: 'Random Tile'
            },
            {
                id: 4,
                label: 'Current Flag'
            }
            
        ],
        sourceTile: { id: 0, label: 'Current Tile'},
        targetTile: { id: 2, label: 'Mewtwo', keyTile: 1 }
    };
    
    
    $scope.$watch('tiles.sourceTile', function() {
        
        game.setPathfinderConsoleTile($scope.tiles.sourceTile, 'SOURCE');
        //var pathfinderTile = {};
        
    });
    
    
    $scope.$watch('tiles.targetTile', function() {
        
        game.setPathfinderConsoleTile($scope.tiles.targetTile, 'TARGET');
        
    });
    
    //    $scope.dropdownSourceTarget = function() {
    //        
    //        alert($scope.soureTile);
    //        alert($scope.targetTile);
    //        
    //    };
    
    
    
    
    
    $scope.pathfinder = {};
    $scope.player = {};
    
    //.$scope.pathfinder.hoverTile = game.pathfinder.hoverTile;
    //$scope.player.hoverTile = game.player.hoverTile;
    
    //$scope.$watch
    
    $scope.pressedSourceTarget = null;
    
    $scope.sourceTarget = 
            
            
            $scope.cssScopeTarget = function(sourceTarget) {
                
                var css = {
                    active: false,
            disabled: false
        };
        
        if (sourceTarget === 'SOURCE') {
            css.active = game.getPathfinderState() === 'SELECT SOURCE';
        }
        else if (sourceTarget === 'TARGET') {
            css.active = game.getPathfinderState() === 'SELECT TARGET';
        }
        
        if (game.getPathfinderState() === 'VISUALIZER' ||
                game.getPathfinderState() === 'ROUTER') {
            css.disabled = true;
        }
        else {
            css.disabled = false;
        }
        
        return css;
        
    };
    
    
    $scope.cssVisualizerRouter = function() {
        
        var css = {
            disabled: false
        };
        
        if (game.getPathfinderState() === 'SELECT SOURCE' ||
                game.getPathfinderState() === 'SELECT TARGET') {
            css.disabled = true;
        }
        else {
            css.disabled = false;
        }
        
        return css;
        
    };
    
    //$scope.sourceTarget = game.hoverTile.type;
    
    //    $scope.$watch(function(){
    //        
    //        var sourceTarget;
    //        var state = game.getPathfinderState();
    //        if (state === 'SELECT SOURCE') {
    //            sourceTarget = 'SOURCE';
    //        }
    //        else if (state === 'SELECT TARGET') {
    //            sourceTarget = 'TARGET';
    //        }
    //        return $scope.sourceTarget;
    //        
    //    }, function() {
    //        $log.info('elephant is');
    //        $log.log($scope.elephant);
    //        
    //    });
    
    
    $scope.clickSourceTarget = function(sourceTarget) {
        
        state = 'SELECT ' + sourceTarget;
        game.startPathfinder(state);
        
    }; 
    
    
    /********* -- Start/Cancel Pathfindind -- ************/
    
    $scope.startPathfinder = function(state) {
        
        game.startPathfinder(state);
        
    };
    
    $scope.clearPathfinder = function() {
        
        game.clearPathfinder();
        
    };
    
    
    
    /********* -- Turn Layers on and off -- ************/
    
    
    $scope.LAYER = {
        click: 'BITMAP',
        hover: null
    };
    
    // Toggle Bitmap/Graphic layer on/off
    $scope.enterLayer = function(LAYER) { $scope.LAYER.hover = LAYER; };
    
    $scope.leaveLayer = function(LAYER) { $scope.LAYER.hover = null; };
    
    $scope.clickLayer = function(LAYER) { $scope.LAYER.click = LAYER; };
    
    // Update active view as necessary
    $scope.$watch('LAYER', function() { 
        
        // Turn Graphic/Bitmap layers on/off based on variables
        var LAYER = $scope.LAYER;
        
        if (LAYER.hover) {
            game.toggleMapLayers(LAYER.hover);
        }
        else {
            game.toggleMapLayers(LAYER.click);
        }
        
    }, true);
    
    
    /********* -- Turn Rows/Columns on and off -- ************/
    
    
    // Toggle rows/cols
    $scope.rowscols = {
        click: false,
        hover: false
    };
    
    $scope.enterRowsCols = function() { $scope.rowscols.hover = true; };
    
    $scope.leaveRowsCols = function() { $scope.rowscols.hover = false; };
    
    $scope.clickRowsCols = function() { $scope.rowscols.click = !$scope.rowscols.click; };
    
    
    // Update active view as necessary
    $scope.$watch('rowscols', function(newValue, oldValue) {
        
        // Turn rows/cols on/off
        var rowscols = $scope.rowscols;
        
        if (rowscols.hover) {
            game.toggleRowsCols('ON');
            //map.ROWSCOLS_STATE = 'ON';
            //map.drawGraphicRowsCols();   
        }
        else if (rowscols.click) {
            game.toggleRowsCols('ON');
            //map.ROWSCOLS_STATE = 'ON';
            //map.drawGraphicRowsCols();
        } else {
            game.toggleRowsCols('OFF');
            //map.ROWSCOLS_STATE = 'OFF';       
        }
        
    }, true);
    
    
    /********* -- Update Speed -- ************/
    
    $scope.speed = {
        click: 1,
        hover: null
    };
    
    $scope.enterSpeed = function(speed) { $scope.speed.hover = speed; };
    
    $scope.leaveSpeed = function(speed) { $scope.speed.hover = null; }; 
    
    $scope.clickSpeed = function(speed) { $scope.speed.click = speed; };
    
    // Update sprite speed
    $scope.$watch('speed', function() {
        
        var speed = $scope.speed;
        
        if (speed.hover) {
            game.setPlayerSpeed(speed.hover);
            //sprite.factorSpeed = speed.hover;
        }
        else if (speed.click) {
            game.setPlayerSpeed(speed.click);
        }
        
    }, true);
    
    /********* -- Update Gender -- ************/
    
    $scope.GENDER = {
        click: 'BOY',
        hover: null
    };
    
    // Toggle Graphic layer on/off
    $scope.enterGender = function(GENDER) { $scope.GENDER.hover = GENDER; };
    
    $scope.leaveGender = function(GENDER) { $scope.GENDER.hover = null; };
    
    $scope.clickGender = function(GENDER) { $scope.GENDER.click = GENDER; };
    
    $scope.$watch('GENDER', function(newValue, oldValue) {
        
        var GENDER = $scope.GENDER;
        
        if (GENDER.hover) {
            game.setPlayerGender(GENDER.hover);
            //sprite.playerOptions.GENDER = ;
        }
        else if (GENDER.click) {
            game.setPlayerGender(GENDER.click);
            //sprite.playerOptions.GENDER = GENDER.click;
        }
        
    }, true);
    
    
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



//    $scope.getPointerXY = function(event) {
//        
//        
//        
//        var layerX = event.layerX;
//        var layerY = event.layerY; 
//        var targetCanvas = event.target.id;
//        
//        return {
//            X: layerX,
//            Y: layerY,
//            canvas: targetCanvas
//        }
//    };
//    
//    $scope.startUserMove = function(event) {
//        
//        var pointerXY = $scope.getPointerXY(event);   
//        map.startUserMove(pointerXY.X, pointerXY.Y, pointerXY.canvas);
//        
//    };
//    
//    $scope.userMove = function(event) {
//        
//        console.log('moving cursor');
//        console.log(event);
//        
//        var sprite = map.sprite;
//        //console.log(event.target.id);
//        
//        
//        if (sprite.MOVE_STATE === 'USER MOVE') {  
//            var pointerXY = $scope.getPointerXY(event);
//            map.highlightTile(pointerXY.X, pointerXY.Y, pointerXY.canvas);
//        }
//            
//    };
//    
//    
//    $scope.endUserMove = function(event) {   
//        
//        var sprite = map.sprite;
//        var pointerXY = $scope.getPointerXY(event);
//        
//        if (sprite.MOVE_STATE === 'USER MOVE') {
//            map.endUserMove(pointerXY.X, pointerXY.Y, pointerXY.canvas);
//        }
//        
//    };