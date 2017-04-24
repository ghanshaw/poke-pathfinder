pokemonApp.directive('userConsole', function(pokeGame) {
    
    
    var link = function($scope, element, attr) {
        
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
            options: game.pathfinder.algorithms,
            selected: game.pathfinder.algorithms[0]
        };
        
        $scope.$watch('algorithms.selected', function() {
            
            game.setPathfinderConsoleAlgorithm($scope.algorithms.selected);
            
        });
        
        
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
        
        
        /********* -- Start/Cancel Pathfinding -- ************/
        
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
    }
    
    return {
        restrict: 'EA',  
        templateUrl: 'app/directives/user-console.html',
        //constroller: 'userController',
        link: link
    };
    
});