pokemonApp.controller('monitorController', function($scope, $log, $location, $document, $window, pokeGame) { 
    
    // Aquire game object
    var game = pokeGame.game;
    
    // Initialize Gameboy
    $scope.monitor = game.monitor;
    $scope.monitor.init();
    $scope.monitor.resize();
    
    /* -------------------- //
    Event handlers
    // -------------------- */
    
    // When document is ready
    angular.element($document).ready(function() {     
        $scope.updateFloorLabel();
        pokeGame.viewLoaded = true;
    });
    
    // On window resize
    var appWindow = angular.element($window);
    appWindow.bind('resize', function () {       
        var view = game.getView();
        if (view === 'monitor') {
            $scope.monitor.resize();
            $scope.updateFloorLabel();
        }
    });
    
    // On orientation change
    window.addEventListener("orientationchange", function() {
        var view = game.getView();
        if (view === 'monitor') {
            $scope.monitor.resize();
            $scope.updateFloorLabel();
        }
    }, false);
    
    
    // On scroll
    appWindow.bind('scroll', function () {     
        var view = game.getView();       
        if (view === 'monitor') {
            $scope.updateFloorLabel();
        }
    });
    
    
    
    /* -------------------- //
    Drag and Drop Functionality
    // -------------------- */
    
    //////////////////////
    // Mouse events
    //////////////////////
    
    // Mouse down on monitor starts dragging
    $scope.startDrag = function($event, action) {
        game.setMonitorPointer($event, action);      
        game.startPlayerDrag($event);
        game.startPointMarkerDrag($event);
        
    };
    
    // Mouse move on monitor reposition pointer
    $scope.movePointer = function(event, type) {
        game.setMonitorPointer(event, type);            
    };
    
    // Mouse end stops dragging of player and point markers
    $scope.endDrag = function($event) {
        game.endPlayerDrag();
        game.endPointMarkerDrag();        
    };
 
    // Clicking updates CLICKED flag
    $scope.clickMonitor = function() { 
        game.clickMonitor(true);
    };     
    
    //////////////////////
    // Touch events
    //////////////////////
    
    // Touch start on monitor starts dragging and
    // updates CLICKED flag
    $scope.touchStartMonitor = function() {       
        var touches = $scope.touchstart.originalEvent.touches;       
        $scope.startDrag(touches[0], 'TOUCH');
        $scope.clickMonitor();
    };
    
    // Touch move on monitor updates pointer
    $scope.touchMoveMonitor = function() {     
        var touches = $scope.touchmove.originalEvent.touches; 
        $scope.movePointer(touches[0], 'TOUCH');
    };
    
    // Touch end on monitor ends dragging
    $scope.touchEndMonitor = function() {
        $scope.endDrag();
    };    
    
    /* -------------------- //
    Floor Label
    // -------------------- */
    
    // Update floor label
    $scope.updateFloorLabel = function() {
        
        // Get location of 'anchors' on monitor
        // Anchors are boundaries of each floor
        var anchors = game.getMonitorAnchors();
        
        // Aquire the floor label DOM element
        var $floor_label = $('.floor-label');
        
        // Aquire and measure monitor DOM element
        var monitor_offset = $('.monitor.background').offset();
        var top = monitor_offset.top;
        var left = monitor_offset.left - 80;
        
        // Update left position of floor label
        $floor_label.css('left', left);
        
        // Update top position of floor label (based on scroll through page)
        var label_position = $floor_label.position();
        var scrollTop = $(window).scrollTop();       
        label_position.top += scrollTop;
        
        // Loop through anchors
        for (let a in anchors) {
            
            // If floor label sits within bounds of floor, update label text
            if (label_position.top > anchors[a].top + monitor_offset.top &&
                    label_position.top < anchors[a].bottom + monitor_offset.top) {
                $scope.currentFloor = a;
                break;
            }
        }         
    };     
});