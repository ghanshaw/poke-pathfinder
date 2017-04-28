pokemonApp.directive('userConsolePanel', function(pokeGame) {
    
    
    var link = function($scope, element, attr) {
        
        var game = pokeGame.game;
        var userConsole = game.userConsole;
        
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
            options: userConsole.algorithms,
            selected: userConsole.selectedAlgorithm
        };        
        
        $scope.$watch('algorithms.selected', function() {
            
            userConsole.selectedAlgorithm = $scope.algorithms.selected;
            
        });
        
        
        $scope.edgeWeight = userConsole.edgeWeight;
        
        $scope.showEdgeWeightSliders = function() {
            var id = $scope.algorithms.selected.id;
            
            if (id === 2 || id === 3) {
                return true;
            }
            return false;
        };
        
        // When user changes edge weight, reveal weight layer
        $scope.$watch('edgeWeight', function(newValue, oldValue) {
            
            userConsole.startInterpolateWeightLayer(newValue, oldValue);
            
        }, true);
        
        
        
        
        
        
        /********* -- Select Source/Target Tiles -- ************/
        
        
        
        $scope.locations = {
            options: userConsole.locations,
            source: userConsole.sourceLocation,
            target: userConsole.targetLocation
        };
        
        //console.log($scope.locations.options);
        
        $scope.$watch('locations.source', function() {
            
            userConsole.sourceLocation = $scope.locations.source;
            
        });
        
        $scope.$watch('locations.target', function() {
            
            userConsole.targetLocation = $scope.locations.target;
            
        });
        
        $scope.disableAstar = function(id) {
            
            if ($scope.locations.source.id === 5) {
                
                if (id === 3) {
                    return true;
                }
                
            }
            
            
        };
        
        $scope.disableAllTiles = function(id) {
            
            if ($scope.algorithms.selected.id === 3) {
                
                if (id === 5) {
                    return true;
                }
                
            }
            
        };
        
        $scope.hideOptions = function(value, index, array) {
            if (value.id === 5) {
                return false;
            }
            return true;
        };
        
        $scope.clickSourceTarget = function(sourceTarget) {           
            state = 'MARK ' + sourceTarget;
            game.startPathfinder(state);          
        };
        
        
        $scope.cssSourceTarget = function(sourceTarget) {
            
            var css = {
                active: false,
                disabled: false
            };
            
            if (sourceTarget === 'SOURCE') {
                css.active = game.getPathfinderState() === 'MARK SOURCE';
            }
            else if (sourceTarget === 'TARGET') {
                css.active = game.getPathfinderState() === 'MARK TARGET';
            }
            
            if (game.getPathfinderState() === 'FRONTIER' ||
                    game.getPathfinderState() === 'PATHER') {
                css.disabled = true;
            }
            else {
                css.disabled = false;
            }
            
            return css;
            
        };
        
        
        /********* -- Start/Cancel Pathfinding -- ************/
        
        $scope.startPathfinder = function(state) {
            
            game.startPathfinder(state);
            
        };
        
        $scope.clearPathfinder = function() {
            
            game.clearPathfinder();
            
        };
        
        $scope.cssPathFrontier = function() {
            
            var css = {
                disabled: false
            };
            
            if (game.getPathfinderState() === 'MARK SOURCE' ||
                    game.getPathfinderState() === 'MARK TARGET') {
                css.disabled = true;
            }
            else {
                css.disabled = false;
            }
            
            return css;
            
        };
        
        /**************** -- Press VCR -- ******************/
        
        $scope.pressVCR = function($event, COMMAND) {
            
            game.handleVCRCommand(COMMAND);
            
        };
        
        
        $scope.cssVCR = function(COMMAND) {
            
            var css = {
                active: false,
                disabled: false
            };
            
            // Existing command
            var vcrCOMMAND = game.getVCRCommand();
            
            if (vcrCOMMAND === null) {
                css.disabled = true;
            }
            // PAUSE button, when VCR set to STEP
            else if (COMMAND === 'PAUSE' & vcrCOMMAND === 'STEP') {
                css.disabled = false;
                css.active = true;
            }
            else if (vcrCOMMAND === COMMAND) {
                css.disabled = false;
                css.active = true;
            };
            
            return css;
            
        };
        
        
        /********* -- Turn Layers on and off -- ************/
        
        
        $scope.mapStateButton = {
            click: 'BITMAP',
            hover: null
        };
        
        // Toggle Bitmap/Graphic layer on/off
        $scope.enterMapStateButton = function(state) { $scope.mapStateButton.hover = state; };
        
        $scope.leaveMapStateButton = function(state) { $scope.mapStateButton.hover = null; };
        
        $scope.clickMapStateButton = function(state) { $scope.mapStateButton.click = state; };
        
        // Update active view as necessary
        $scope.$watch('mapStateButton', function() { 
            
            // Turn Graphic/Bitmap layers on/off based on variables
            var mapStateButton = $scope.mapStateButton;
            
            if (mapStateButton.hover) {
                game.toggleMapState(mapStateButton.hover);
            }
            else {
                game.toggleMapState(mapStateButton.click);
            }
            
        }, true);
        
        
        /********* -- Turn Rows/Columns on and off -- ************/
        
        
        // Toggle rows/cols
        $scope.gridButton = {
            click: false,
            hover: false
        };
        
        $scope.enterGridButton = function() { $scope.gridButton.hover = true; };
        
        $scope.leaveGridButton = function() { $scope.gridButton.hover = false; };
        
        $scope.clickGridButton = function() { $scope.gridButton.click = !$scope.gridButton.click; };
        
        
        // Update active view as necessary
        $scope.$watch('gridButton', function(newValue, oldValue) {
            
            // Turn rows/cols on/off
            var button = $scope.gridButton;
            
            if (button.hover) {
                game.toggleGrid(true);
                //map.ROWSCOLS_STATE = 'ON';
                //map.drawGraphicRowsCols();   
            }
            else if (button.click) {
                game.toggleGrid(true);
                //map.ROWSCOLS_STATE = 'ON';
                //map.drawGraphicRowsCols();
            } else {
                game.toggleGrid(false);
                //map.ROWSCOLS_STATE = 'OFF';       
            }
            
        }, true);
        
        
        /********* -- Turn Frontier Button on/off -- ************/
        
        
        // Toggle rows/cols
        userConsole.frontierButton = {
            click: false,
            hover: false
        };
        
        $scope.frontierButton = userConsole.frontierButton;

        
        $scope.enterFrontierButton = function() { 
            $scope.frontierButton.hover = true; 
            watchFrontierButton(); 
        };
        
        $scope.leaveFrontierButton = function() { 
            $scope.frontierButton.hover = false; 
            watchFrontierButton(); 
        };
        
        $scope.clickFrontierButton = function() {
            
            var button = $scope.frontierButton;
            button.click = !button.click;
            button.hover = button.click;
            watchFrontierButton();          
        };
        
        var watchFrontierButton = function() {
            
            // Hide/reveal path layers
            var button = $scope.frontierButton;
            
            if (button.hover) {
                let LAYER = button.hover;
                game.toggleMapPathfinderLayer('FRONTIER');
            }
            else if (button.click) {
                let LAYER = button.click;
                game.toggleMapPathfinderLayer('FRONTIER');
                
            } else {
                game.toggleMapPathfinderLayer(null);     
            }
            
        };
        
        // Update active view as necessary
        $scope.$watch('frontierButton', watchFrontierButton, true);
        
        
        $scope.cssFrontierButton =  function() {
            
            var css = {
                active: false,
                disabled: true
            };
            
            // If pathfinder has this layer, enable it
            if (game.getPathfinderLayer() === 'FRONTIER') {
               css.disabled = false;
            }
                
            // If layer is active in map, make it active
            var mapLayers = game.getMapLayers();
            if (mapLayers.PATHFINDER === 'FRONTIER') {
                //$scope.frontierButton.click = true;
            }                
            
            css.active = $scope.frontierButton.click;
            
            return css;
            
        };
        
        
        /********* -- Turn Path Button on/off -- ************/
        
        
        // Toggle rows/cols
        userConsole.pathButton = {
            click: false,
            hover: false
        };
        
        $scope.pathButton = userConsole.pathButton;

        
        $scope.enterPathButton = function() { 
            $scope.pathButton.hover = true; 
            watchPathButton(); 
        };
        
        $scope.leavePathButton = function() { 
            $scope.pathButton.hover = false; 
            watchPathButton(); 
        };
        
        $scope.clickPathButton = function() {
            
            var button = $scope.pathButton;
            button.click = !button.click;
            button.hover = button.click;
            watchPathButton();          
        };
        
        var watchPathButton = function() {
            
            // Hide/reveal path layers
            var button = $scope.pathButton;
            
            if (button.hover) {
                game.toggleMapPathfinderLayer('PATH');
            }
            else if (button.click) {
                game.toggleMapPathfinderLayer('PATH');
                
            } else {
                game.toggleMapPathfinderLayer(null);     
            }
            
        };
        
        // Update active view as necessary
        $scope.$watch('pathButton', watchPathButton, true);
        
        
        $scope.cssPathButton =  function() {
            
            var css = {
                active: false,
                disabled: true
            };
            
            // If pathfinder has this layer, enable it
            if (game.getPathfinderLayer() === 'PATH') {
               css.disabled = false;
            }
                
            // If layer is active in map, make it active
            var mapLayers = game.getMapLayers();
            if (mapLayers.PATHFINDER === 'PATH') {
                //$scope.frontierButton.click = true;
            }                
            
            css.active = $scope.pathButton.click;
            
            return css;
            
        };
        
        /********* -- Message to User -- ************/
        
        
        $scope.message = userConsole.message;
        
        
        
//        // Toggle rows/cols
//        $scope.pathButton = {
//            click: false,
//            hover: false
//        };
//        
//        $scope.enterPathfinderLayerButto = function(true) { 
//            $scope.pathfinderLayerButton.hover = LAYER; 
//            watchPathfinderLayerButton();
//        };
//        
//        $scope.leavePathfinderLayerButto = function() { 
//            $scope.pathfinderLayerButton.hover = null; 
//            watchPathfinderLayerButton();
//        };
//        
//        $scope.clickPathfinderLayerButton = function() {
//            
//            
//            
//            var button = $scope.pathfinderLayerButton.click;
//            
//            button.click = !button.click;
//            
//            watchPathfinderLayerButton();          
//        };
//        
//        var watchPathfinderLayerButton = function() {
//            
//            // Hide/reveal path layers
//            var button = $scope.pathfinderLayerButton;
//            
//            if (button.hover) {
//                let LAYER = button.hover;
//                game.toggleMapPathfinderLayer(LAYER);
//            }
//            else if (button.click) {
//                let LAYER = button.click;
//                game.toggleMapPathfinderLayer('FRONTIER');
//                
//            } else {
//                game.toggleMapPathfinderLayer(null);     
//            }
//            
//        };
//        
//        // Update active view as necessary
//        $scope.$watch('pathfinderLayerButton', watchPathfinderLayerButton, true);
//        
//        
//        $scope.cssPathfinderLayerButton =  function(LAYER) {
//            
//            var css = {
//                active: false,
//                disabled: true
//            };
//            
//            // If pathfinder has this layer, enable it
//            if (game.getPathfinderLayer() === LAYER) {
//               css.disabled = false;
//            }
//                
//            // If layer is active in map, make it active
//            var mapLayers = game.getMapLayers();
//            if (mapLayers.PATHFINDER === LAYER) {
//                $scope.pathfinderLayerButton.click = LAYER;
//            }                
//            
//            css.active = $scope.pathfinderLayerButton.click === LAYER;
//            
//            return css;
//            
//        };        
        
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
    };
    
    return {
        restrict: 'EA',  
        scope: false,
        templateUrl: 'app/directives/user-console-panel.html',
        //constroller: 'userController',
        link: link
    };
    
});