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
        
        $scope.locations = {
            options: userConsole.getLocations(),
            source: userConsole.getSourceLocation(),
            target: userConsole.getTargetLocation()
        };
        
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
        
        
        $scope.disableAstar = function(id) {          
            if ($scope.locations.target.id === 5) {
                if (id === 3) { return true; }              
            }     
        };
        
        $scope.disableAllTiles = function(id) {
            if ($scope.algorithms.selected.id === 3) {  
                if (id === 5) { return true; }        
            }
        };
        
        $scope.hideOptions = function(value, index, array) {
            if (value.id === 5) { return false; }
            return true;
        };
        
        
        /********* -- PointMarker Buttons -- ************/
        
        $scope.pointMarkerButton = {
            active: false,
            disabled: false
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
        
        /********* -- Point Marker Checkbox -- ************/
        
        $scope.pointMarkerCheckbox = {
            source: {
                click: false,
                active: false,
                disabled: false,
                freeze: false,
                label: 'show'
            },            
            target: {
                click: false,
                active: false,
                disabled: false,
                freeze: false,
                label: 'show'
            }        
        };
        
        
        
        $scope.clickPointMarkerCheckbox = function(point) {
            
            var checkbox;            
            if (point === 'SOURCE') {
                checkbox = $scope.pointMarkerCheckbox.source;
            }
            if (point === 'TARGET') {
                checkbox = $scope.pointMarkerCheckbox.target;
            }
            
            userConsole.togglePointMarker(point, checkbox);
            
        };
        
        
        $scope.cssPointMarkerCheckbox = function(point) {
            
            var checkbox = $scope.pointMarkerCheckbox;
            var pointmarker = userConsole.getPointMarker(point);
            
            if (point === 'SOURCE') {
                
                if (pointmarker.disabled) {
                    checkbox.source.disabled = true;
                    checkbox.source.active = false;
                    checkbox.source.label = '';
                    
                } else {      
                    checkbox.source.disabled = false;
                    if (!checkbox.source.active) {
                        checkbox.source.label = 'show';
                    }
                }
                return checkbox.source;
            }
            else if (point === 'TARGET') {
                
                if (pointmarker.disabled) {
                    checkbox.target.disabled = true;
                    checkbox.target.active = false;
                    checkbox.target.label = '';
                    return checkbox.target;
                }
                else {
                    checkbox.target.disabled = false;
                    if (!checkbox.target.active) {
                        checkbox.target.label = 'show';
                    }
                }
            }
            
            return checkbox.target;
        };


        /********* -- Start/Cancel Pathfinding -- ************/
        
        $scope.pathFrontierButtons = {
            path: {
                click: false,
                active: false,
                disabled: false
            },            
            frontier: {
                click: false,
                active: false,
                disabled: false
            }        
        };
        
        $scope.startPathfinder = function(button) {  
            userConsole.startPathfinder(button);
        };
        
        $scope.clearPathfinder = function() {            
            userConsole.clearPathfinder();            
        };
        
        $scope.cssPathFrontierButtons = function(button) {
            
            var element;
            
            if (button === 'PATH') {
                element = $scope.pathFrontierButtons.path;
            }
            
            else if (button === 'FRONTIER') {
                element = $scope.pathFrontierButtons.frontier;
            }
            
            var state = userConsole.getPathfinderState();
            
            if (state === 'MARK SOURCE' ||
                    state === 'MARK TARGET') {
                element.disabled = true;
            }
            else if (state === button) {
                element.active = true;
            }
            else {
                element.active = false;
            }
            
            return element;
            
        };
        
        /**************** -- Press VCR -- ******************/
        $scope.vcrButtons = {
            PLAY: {
                active: false,
                disabled: false
            },
            PAUSE: {
               active: false,
               disabled: false
           },
           STEP: {
               active: false,
               disabled: false
           }
       };
        

        $scope.pressVCR = function($event, userCommand) {            
            userConsole.handleVCRCommand(userCommand);
        };
        
        
        $scope.cssVCR = function(userCommand) {
            
            var button = $scope.vcrButtons[userCommand];
            
            button.active = false;
            button.disabled = false;
            
            // Existing command
            var vcrCommand = userConsole.getVCRCommand();        
            
            if (vcrCommand === null) {
                button.disabled = true;
            }
        
            // PAUSE button, when VCR set to STEP
            else if (userCommand === 'PAUSE' & vcrCommand === 'STEP') {
                button.disabled = false;
                button.active = true;
            }
            
            else if (vcrCommand === userCommand) {
                button.disabled = false;
                button.active = true;
            };
            
            return button;
            
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
        
        
        /********* -- Toggle Path Layer -- ************/
        
        $scope.pathButton = {
            active: false,
            hover: false,
            disabled: true  
        };
        
        $scope.enterPathButton = function() { 
            
            var button = $scope.pathButton;
            button.hover = true;
            userConsole.togglePathlayer(button);
            
        };
        
        $scope.leavePathButton = function() {
            
            var button = $scope.pathButton;
            button.hover = false;
            userConsole.togglePathlayer(button);
            
        };
        
        $scope.clickPathButton = function() {
            
            var button = $scope.pathButton;
            button.click = true;          
            layer = userConsole.togglePathlayer(button);
            if (layer.on) {
                button.active = true;
            } else {
                button.active = false;
            }
            button.click = false;
            button.hover = false;
            
        };
        
        $scope.cssPathButton =  function() {
            
            var button = $scope.pathButton;
            
            var layer = userConsole.getPathlayer();
            
            if (layer.disabled) {
                button.active = false;
                button.disabled = true;
            }
            else if (layer.on) {
                
                button.disabled = false;
                if (!button.hover) {
                    button.active = true;  
                }
                
            }
            
            return button;
        };
        
        /********* -- Toggle Path/Frontier Layer -- ************/
        
        $scope.pathfinderLayerButtons = {
            path: {
                active: false,
                hover: false,
                disabled: true, 
                click: false
            },
            frontier: {
                active: false,
                hover: false,
                disabled: true, 
                click: false
            }            
        };
        
        $scope.getPathfinderLayerButton = function(selection) {
            
            var button;
            if (selection === 'PATH') {
                button = $scope.pathfinderLayerButtons.path;
            }
            else if (selection === 'FRONTIER') {
                button = $scope.pathfinderLayerButtons.frontier;
            }
            return button;
            
        };
        
        $scope.enterPathfinderLayerButton = function(selection) { 
            
            var button = $scope.getPathfinderLayerButton(selection);
            button.hover = true;
            userConsole.togglePathfinderLayer(selection, button);
            
        };
        
        $scope.leavePathfinderLayerButton = function(selection) {
            
            var button = $scope.getPathfinderLayerButton(selection);         
            button.hover = false;
            userConsole.togglePathfinderLayer(selection, button);
            
        };
        
        $scope.clickPathfinderLayerButton = function(selection) {
            
            var button = $scope.getPathfinderLayerButton(selection);
            button.click = true;
            userConsole.togglePathfinderLayer(selection, button);
            button.click = false;
        };
        
        
            
        $scope.cssPathfinderLayerButton =  function(selection) {
            
            
            var button = $scope.getPathfinderLayerButton(selection);
            var layer = userConsole.getPathfinderLayer(selection);
           
            if (layer.disabled) {
                button.disabled = true;
                button.active = false;
            }
            
            else if (layer.on) {
                button.disabled = false;
                button.active = layer.active;             
            } else {
                button.active = false;
            }
            
            return button;
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