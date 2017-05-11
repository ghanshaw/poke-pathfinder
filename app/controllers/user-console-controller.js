pokemonApp.controller('userConsoleController', function($scope, $log, $location, pokeGame) {
    
    $log.info('*** User Console controller has begun.');
     
    // Aquire game objects
    var game = pokeGame.game;
    var userConsole = game.userConsole;
    
    /********* -- Select Algorithm -- ************/
    
    // Get algorithms from User Console, attach to scope
    $scope.algorithms = {
        options: userConsole.getAlgorithms(),
        selected: userConsole.getSelectedAlgorithm()
    };        
    
    // Update selected algorithms when DOM changes
    $scope.$watch('algorithms.selected', function() {      
        var algorithm = $scope.algorithms.selected;
        userConsole.setSelectedAlgorithm(algorithm);      
    });
    
    /********* -- Modify Edge Weights -- ************/
    
    // Get edg weights from User Console
    $scope.edgeWeight = userConsole.getEdgeWeights();
    
    // Show edge weights in a slider on DOM
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
    
    /********* -- Select Source/Target Tiles in Dropdown -- ************/
    
    // Get source/target locations from User Console
    $scope.locations = userConsole.locations;
    
   
    // Update User Console when Source Location changes
    $scope.$watch('locations.source', function() {        
        var location = $scope.locations.source;
        userConsole.setSourceLocation(location);        
    });
    
    // Update User Consle when Target Location changes
    $scope.$watch('locations.target', function() {        
        var location = $scope.locations.target;
        userConsole.setTargetLocation(location);       
    });
    
    //-----> Disable different options in dropdown //
    
    // Disable A* if "all tiles" is selected as target
    // disable managed in ng-options in html
    $scope.disableAstar = function(id) { 
        // 'All Tiles' is location with id 5
        if ($scope.locations.target.id === 5) {
            // A* is algorithm with id 3
            if (id === 3) { return true; }              
        }     
    };
    
    // Disable "all tiles" if A* is selected as algorithm
    $scope.disableAllTiles = function(id) {
        if ($scope.algorithms.selected.id === 3) {  
            if (id === 5) { return true; }        
        }
    };
    
    // Hide 'All Tiles' in Source Location dropdown (cannot start from 'All Tiles')
    // Implemented with filter in html
    $scope.hideOptions = function(value, index, array) {
        // 'All Tiles' is location with id 5
        if (value.id === 5) { return false; }
        return true;
    };
    
    
    /********* -- PointMarker Buttons -- ************/
    
    // Get point markers button objects from User Console
    $scope.pointmarker = userConsole.getPointMarker();
    
    // Start Pathfinder when user clicked Point Marker button
    $scope.clickPointMarkerButton = function(sourceTarget) {           
        mode = 'PLACE ' + sourceTarget;
        game.startPathfinder(mode);          
    };
    
    // Toggle Point Marker when user clicks checkbox
    $scope.clickPointMarkerCheckbox = function(point) {     
        userConsole.togglePointMarker(point);            
    };
    
    // Control Point Marker label on checkbox
    $scope.labelPointMarkerCheckbox = function(point) {         
        var checkbox;       
        // Get corresponding checkbox from User Console
        if (point === 'SOURCE') {
            checkbox = $scope.pointmarker.source.checkbox;
        }
        if (point === 'TARGET') {
            checkbox = $scope.pointmarker.target.checkbox;
        }
        
        // Update label based on whether checkbox is active
        var label;
        if (!checkbox.disabled) {      
            label = checkbox.active ? 'hide' : 'show';
        } 
        else { label = ''; }
        
        return label;  
    };
    
    
    /********* -- Start/Cancel Pathfinding -- ************/
    
    
    // Get Pathfinder Task button objects from User Console
    // These are the 'Follow Path' and 'Generate Frontier' buttons
    $scope.pathfindertask = userConsole.getPathfinderTaskButtons();
    
    // Start pathfinder when Task Button is clicked
    $scope.startPathfinder = function(button) {  
        userConsole.startPathfinder(button);
    };
    
    // Clear pathfinder when Clear button is clicked
    $scope.clearPathfinder = function() {            
        userConsole.clearPathfinder();            
    };
    
    
    /**************** -- Press VCR -- ******************/
    
    // Get VCR button objects from User Console
    $scope.vcr = userConsole.getVCR();
    
    // Update VCR when VCR buttons are pressed by User
    $scope.pressVCR = function($event, userCommand) {            
        userConsole.handleVCRCommand(userCommand);
    };
    
    
    /********* -- Turn Layers on and off -- ************/
    
    // Button object for map state
    $scope.mapStateButton = {
        click: 'BITMAP',
        hover: null
    };
    
    // Toggle Bitmap/Graphic layer on/off
    $scope.enterMapStateButton = function(state) { $scope.mapStateButton.hover = state; };
    
    $scope.leaveMapStateButton = function(state) { $scope.mapStateButton.hover = null; };
    
    $scope.clickMapStateButton = function(state) { $scope.mapStateButton.click = state; };
    
    // Update view when button object changes
    $scope.$watch('mapStateButton', function() { 
        
        // Get button object
        var mapStateButton = $scope.mapStateButton;
        
        // Update User Console based on button object
        if (mapStateButton.hover) {
            userConsole.toggleMapState(mapStateButton.hover);
        }
        else {
            userConsole.toggleMapState(mapStateButton.click);
        }
        
    }, true);
    
    
    /********* -- Turn Rows/Columns on and off -- ************/
      
    // Button object for grid state
    $scope.gridButton = {
        click: false,
        hover: false
    };
    
    // Toggle gridlines on and off
    $scope.enterGridButton = function() { $scope.gridButton.hover = true; };
    
    $scope.leaveGridButton = function() { $scope.gridButton.hover = false; };
    
    $scope.clickGridButton = function() { $scope.gridButton.click = !$scope.gridButton.click; };
    
    // Update view when button object changes
    $scope.$watch('gridButton', function(newValue, oldValue) {
        
        // Get button object
        var button = $scope.gridButton;
        
        // Update User Console based on button object
        if (button.hover) {
            userConsole.toggleGrid(true); 
        }
        else if (button.click) {
            userConsole.toggleGrid(true);
        } else {
            userConsole.toggleGrid(false);
        }
        
    }, true);
    
    
    /********* -- Toggle Path/Frontier Layer -- ************/
    
    // Get Pathfinder Layer button objects
    $scope.pathfinderlayer = userConsole.getPathfinderLayer(); 
    
    // Update Pathfinder Layer button objects based on mouse behavior
    // Send updates to User Console
    $scope.enterPathfinderLayerButton = function(selection) { 
        userConsole.togglePathfinderLayerButton('hover', selection);          
    };
    
    $scope.leavePathfinderLayerButton = function(selection) {
        userConsole.togglePathfinderLayerButton(null, selection);         
    };
    
    $scope.clickPathfinderLayerButton = function(selection) {
        userConsole.togglePathfinderLayerButton('click', selection);
    };    
    
    
    /********* -- Activity Log -- ************/
    
    // Get Activity Log messages array from User Console
    $scope.activity = userConsole.getActivityLog(); 
    
    // Update height of Activity Log based on messages
    $scope.updateLogHeight = function() {
        
        // Get log DOM elements
        var log = {};    
        log.element = $('.activity-log');
        log.wrapper = $('.activity-log .wrapper');
        
        // Measure log wrapper
        log.wrapperHeight = log.wrapper.height();
        
        // Update log height to match wrapper
        log.element.css('height', log.wrapperHeight);
        
        // Position scrollbar to bottom of activity log window when heigh increases
        var scrollHeight = log.wrapper[0].scrollHeight;
        log.wrapper.scrollTop(scrollHeight);
        
    };
    
    // Update log height when number log messages increases
    $scope.$watch('activity', function() {
        $scope.updateLogHeight();
    }, true);
    
    
    
    
    /********* -- Update Speed -- ************/
    
    // Get speed button from User Console
    $scope.speed = {
        button: userConsole.getSpeedButton()
    };
    
    // Update User Console based on mouse behavior on DOM
    $scope.enterSpeed = function(speed) { 
        userConsole.holdSpeedButton(speed);
    };
    
    $scope.leaveSpeed = function() { 
        userConsole.holdSpeedButton(null);
    }; 
    
    $scope.clickSpeed = function(speed) { 
        userConsole.clickSpeedButton(speed);
    };
    
    /********* -- Update Gender -- ************/
    
    // Get Gender button from User Console
    $scope.gender = {
        button: userConsole.getGenderButton()
    };
    
    // Update Gender based on mouse behavior on DOM
    $scope.enterGender = function(gender) { 
        userConsole.holdGenderButton(gender);
    };
    
    $scope.leaveGender = function() { 
        userConsole.holdGenderButton(null);
    };
    
    $scope.clickGender = function(gender) { 
        userConsole.clickGenderButton(gender);
    };    
    
});