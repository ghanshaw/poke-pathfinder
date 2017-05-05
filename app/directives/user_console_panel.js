pokemonApp.directive('userConsolePanel', function(pokeGame) {
    
    
    var link = function($scope, element, attr) {
        
        console.info('console loading');
        
        var game = pokeGame.game;
        var userConsole = game.userConsole;
        
        
        /********* -- Select Algorithm -- ************/
        
        
        $scope.algorithms = {
            options: userConsole.getAlgorithms(),
            selected: userConsole.getSelectedAlgorithm()
        };        
        
        $scope.$watch('algorithms.selected', function() {
            
            var algorithm = $scope.algorithms.selected;
            userConsole.setSelectedAlgorithm(algorithm);
            
        });
        
        /********* -- Modify Edge Weights -- ************/
        
        $scope.edgeWeight = userConsole.getEdgeWeights();
        
        $scope.showEdgeWeightSliders = function() {
            var id = $scope.algorithms.selected.id;
            
            // Show sliders if selected algorithm is Dijkstra's or A*
            if (id === 2 || id === 3) {
                return true;
            }
            return false;
        };
        
        // When user changes edge weight, reveal weight layer
        $scope.$watch('edgeWeight', function(newValue, oldValue) {
            
            userConsole.startWeightChange(newValue, oldValue);
            
        }, true);
        
        
        /********* -- Select Source/Target Tiles -- ************/
        
//        $scope.locations = {
//            options: userConsole.getLocations(),
//            source: userConsole.getSourceLocation(),
//            target: userConsole.getTargetLocation()
//        };
        
        $scope.locations = userConsole.locations;
        
        
        
        //console.log($scope.locations.options);
        
        $scope.$watch('locations.source', function() {
            
            var location = $scope.locations.source;
            userConsole.setSourceLocation(location);
            
        });
        
        $scope.$watch('locations.target', function() {
            
            var location = $scope.locations.target;
            userConsole.setTargetLocation(location);
            
        });
        
        //-----> Disable different options in dropdown //
        
        // Disable A* if "all tiles" is selected as target
        $scope.disableAstar = function(id) {          
            if ($scope.locations.target.id === 5) {
                if (id === 3) { return true; }              
            }     
        };
        
        // Disable "all tiles" if A* is selected as algorithm
        $scope.disableAllTiles = function(id) {
            if ($scope.algorithms.selected.id === 3) {  
                if (id === 5) { return true; }        
            }
        };
        
//        // Disable Path task button if "all tiles" is selected
//        $scope.disablePathTaskButton = function(id) {
//            if ($scope.algorithms.selected.id === 3) {  
//                //if (id === 5) { return true; }        
//            }
//        };
        
        $scope.hideOptions = function(value, index, array) {
            if (value.id === 5) { return false; }
            return true;
        };
        
        
        /********* -- PointMarker Buttons -- ************/
        

        $scope.pointmarker = userConsole.getPointMarker();
        
        $scope.clickPointMarkerButton = function(sourceTarget) {           
            state = 'MARK ' + sourceTarget;
            game.startPathfinder(state);          
        };
  
        $scope.clickPointMarkerCheckbox = function(point) {     
            userConsole.togglePointMarker(point);            
        };
        
        
        $scope.labelPointMarkerCheckbox = function(point) {         
            var checkbox;            
            if (point === 'SOURCE') {
                checkbox = $scope.pointmarker.source.checkbox;
            }
            if (point === 'TARGET') {
                checkbox = $scope.pointmarker.target.checkbox;
            }
            
            var label;
            if (!checkbox.disabled) {      
                label = checkbox.active ? 'hide' : 'show';
            } 
            else { label = ''; }
            
            return label;  
        };


        /********* -- Start/Cancel Pathfinding -- ************/
       
        
        //$scope.pathfinderlayer = userConsole.getPathfinderLayer();
        $scope.pathfindertask = userConsole.getPathfinderTask();
        
        $scope.startPathfinder = function(button) {  
            userConsole.startPathfinder(button);
        };
        
        $scope.clearPathfinder = function() {            
            userConsole.clearPathfinder();            
        };
        
       
        /**************** -- Press VCR -- ******************/
       
       $scope.vcr = userConsole.getVCR();

        $scope.pressVCR = function($event, userCommand) {            
            userConsole.handleVCRCommand(userCommand);
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
                userConsole.toggleMapState(mapStateButton.hover);
            }
            else {
                userConsole.toggleMapState(mapStateButton.click);
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
                userConsole.toggleGrid(true);
                //map.ROWSCOLS_STATE = 'ON';
                //map.drawGraphicRowsCols();   
            }
            else if (button.click) {
                userConsole.toggleGrid(true);
                //map.ROWSCOLS_STATE = 'ON';
                //map.drawGraphicRowsCols();
            } else {
                userConsole.toggleGrid(false);
                //map.ROWSCOLS_STATE = 'OFF';       
            }
            
        }, true);
        
        
        /********* -- Toggle Path/Frontier Layer -- ************/
        
        $scope.pathfinderlayer = userConsole.getPathfinderLayer(); 
        
        $scope.enterPathfinderLayerButton = function(selection) { 
            userConsole.togglePathfinderLayerButton('hover', selection);          
        };
        
        $scope.leavePathfinderLayerButton = function(selection) {
            userConsole.togglePathfinderLayerButton(null, selection);         
        };
        
        $scope.clickPathfinderLayerButton = function(selection) {
            userConsole.togglePathfinderLayerButton('click', selection);
        };    
        
        
        /********* -- Message to User -- ************/
        
        $scope.message = userConsole.message;          
        
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
                userConsole.setPlayerSpeed(speed.hover);
                //sprite.factorSpeed = speed.hover;
            }
            else if (speed.click) {
                userConsole.setPlayerSpeed(speed.click);
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
                userConsole.setPlayerGender(GENDER.hover);
            }
            else if (GENDER.click) {
                userConsole.setPlayerGender(GENDER.click);
            }
            
        }, true);
        
        
        
        
        
        $scope.game = game;
        
        $scope.debugClick = function() {
            
            game.map.addRemoveGaps(true);
            game.map.createMapLayers(game.graph);
            
        };
        
        $scope.debugClick2 = function() {
            
            game.map.addRemoveGaps(false);
            
        };
        
        
        
    };
    
    return {
        restrict: 'EA',  
        scope: false,
        templateUrl: 'app/directives/user-console-panel.html',
        //constroller: 'userController',
        link: link
    };
    
});


//        $scope.cssPointMarkerButton = function(sourceTarget) {
//            
//            $scope.pointmarker;
//            
//            var css = {
//                active: false,
//                disabled: false
//            };
//            
//            var button;
//            if (sourceTarget === 'SOURCE') {
//                button = userConsole.getPointMarkerButton('SOURCE');
//            }
//            else if (sourceTarget === 'TARGET') {
//                button = userConsole.getPointMarkerButton('TARGET');
//            }
//            
//            css.active = button.active;
//            css.disabled = button.disabled;
//            
////            if (game.getPathfinderState() === 'FRONTIER' ||
////                    game.getPathfinderState() === 'PATHER') {
////                css.disabled = true;
////            }
////            else {
////                css.disabled = false;
////            }
//            
//            return css;
//            
//        };


      
        /********* -- Point Marker Checkbox -- ************/
        
//        $scope.pointMarkerCheckbox = {
//            source: {
//                click: false,
//                active: false,
//                disabled: false,
//                freeze: false,
//                label: 'show'
//            },            
//            target: {
//                click: false,
//                active: false,
//                disabled: false,
//                freeze: false,
//                label: 'show'
//            }        
//        };
//        
        
//            var checkbox;            
//            if (point === 'SOURCE') {
//                checkbox = $scope.pointMarkerCheckbox.source;
//            }
//            if (point === 'TARGET') {
//                checkbox = $scope.pointMarkerCheckbox.target;
//            }

//        $scope.pointMarkerButton = {
//            active: false,
//            disabled: false
//        };
        
        
//        $scope.$apply(function() {
//            $scope.pointmarker = userConsole.getPointMarker();
//        });

//        $scope.cssPointMarkerCheckbo = function(point) {
//            
//            var checkbox = $scope.pointMarkerCheckbox;
//            var pointmarker = userConsole.getPointMarker(point);
//            
//            if (point === 'SOURCE') {
//                
//                if (pointmarker.disabled) {
//                    checkbox.source.disabled = true;
//                    checkbox.source.active = false;
//                    checkbox.source.label = '';
//                    
//                } else {      
//                    checkbox.source.disabled = false;
//                    if (pointmarker.show) {
//                        checkbox.source.active = true;
//                    }
////                    if (!checkbox.source.active) {
////                        checkbox.source.label = 'show';
////                    }
//                }
//                return checkbox.source;
//            }
//            else if (point === 'TARGET') {
//                
//                if (pointmarker.disabled) {
//                    checkbox.target.disabled = true;
//                    checkbox.target.active = false;
//                    checkbox.target.label = '';
//                    return checkbox.target;
//                }
//                else {
//                    checkbox.target.disabled = false;
//                    if (!checkbox.target.active) {
//                        checkbox.target.label = 'show';
//                    }
//                }
//            }
//            
//            return checkbox.target;
//        };

//        $scope.pathFrontierButtons = {
//            path: {
//                click: false,
//                active: false,
//                disabled: false
//            },            
//            frontier: {
//                click: false,
//                active: false,
//                disabled: false
//            }        
//        };


//        $scope.cssPathFrontierButtons = function(button) {
//            
////            var element;
////            
////            if (button === 'PATH') {
////                element = $scope.pathFrontierButtons.path;
////            }
////            
////            else if (button === 'FRONTIER') {
////                element = $scope.pathFrontierButtons.frontier;
////            }
////            
////            var state = userConsole.getPathfinderState();
////            
////            if (state === 'MARK SOURCE' ||
////                    state === 'MARK TARGET') {
////                element.disabled = true;
////            }
////            else if (state === button) {
////                element.active = true;
////            }
////            else {
////                element.active = false;
////            }
////            
////            return element;
//            
//        };


//        $scope.vcrButtons = {
//            PLAY: {
//                active: false,
//                disabled: false
//            },
//            PAUSE: {
//               active: false,
//               disabled: false
//           },
//           STEP: {
//               active: false,
//               disabled: false
//           }
//       };


//        $scope.cssVC = function(userCommand) {
//            
//            var button = $scope.vcrButtons[userCommand];
//            
//            button.active = false;
//            button.disabled = false;
//            
//            // Existing command
//            var vcrCommand = userConsole.getVCRCommand();        
//            
//            if (vcrCommand === null) {
//                button.disabled = true;
//            }
//        
//            // PAUSE button, when VCR set to STEP
//            else if (userCommand === 'PAUSE' & vcrCommand === 'STEP') {
//                button.disabled = false;
//                button.active = true;
//            }
//            
//            else if (vcrCommand === userCommand) {
//                button.disabled = false;
//                button.active = true;
//            };
//            
//            return button;
//            
//        };