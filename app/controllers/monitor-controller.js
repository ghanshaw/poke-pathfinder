pokemonApp.controller('monitorController', function($scope, $log, $location, $window, pokeGame) { 
    
    
    var game = pokeGame.game;
    $scope.monitor = game.monitor;
    $scope.monitor.init();
    $scope.monitor.resize();
    
    var appWindow = angular.element($window);
    
    appWindow.bind('resize', function () {
        
        var view = game.getView();
        
        if (view === 'monitor') {
            $scope.monitor.resize();
            $scope.updateFloorLabel();
        }
        
//        var path = $location.path();
//        if (path === '/') {
//            $scope.view = 'gameboy';
//        } else {
//            
//        }
    });
    
    appWindow.bind('scroll', function () {
	$scope.updateFloorLabel();
    });
    
    angular.element(document).ready(function () {
        
        $scope.updateFloorLabel();
        pokeGame.viewLoaded = true;
    
    });
    
    
    
    
    //    //game.initMonitor();
    //    game.monitor.initCanvas();
    //    game.monitor.createMonitorBackground();
    //    game.monitor.createGrid();
    //    game.monitor.drawMonitor();
    
    $scope.touchStartMonitor = function() {
       
        var touches = $scope.touchevent.originalEvent.touches;
        
        
        $scope.startDrag(touches[0], 'TOUCH');
        $scope.clickPointer();
    };
    
    $scope.touchMoveMonitor = function() {
        
        var touches = $scope.touchevent.originalEvent.touches; 
        $scope.movePointer(touches[0], 'TOUCH');

    };
    
    $scope.touchEndMonitor = function() {
        $scope.endDrag();
    };
    
    
    $scope.startDrag = function($event, action) {
        
        //alert('started dragging');
        
        game.setMonitorPointer($event, action);
        
        game.startPlayerDrag($event);
        game.startPointMarkerDrag($event);
        
    };
    
    // For both hovering and dragging
    $scope.movePointer = function(event, type) {
        
        game.setMonitorPointer(event, type);    
        console.log('hovering');  
        
    };
    
    $scope.endDrag = function($event) {
        console.log("At first, pathfinder state was: " + game.pathfinder.PATH_STATE);
        
        console.log('finished dragging');
        game.endPlayerDrag();
        game.endPointMarkerDrag();
        
        console.log("Now it's: " + game.pathfinder.PATH_STATE);
        
    };
 
    
    $scope.clickPointer = function() { 
        console.log('I just clicked the monitor');
        game.CLICKED = true; 
    };     
    
    $scope.updateFloorLabel = function() {
        
        var anchors = game.getMonitorAnchors();
        
        var $floor_label = $('.floor-label');
        var monitor_offset = $('.monitor.background').offset();
        
        var top = monitor_offset.top;
        var left = monitor_offset.left - 80;
        
        $floor_label.css('left', left);
        
        var label_position = $floor_label.position();
        var scrollTop = $(window).scrollTop();
        
        label_position.top += scrollTop;
        
        for (let a in anchors) {
            
            if (label_position.top > anchors[a].top + monitor_offset.top &&
                    label_position.top < anchors[a].bottom + monitor_offset.top) {
                $scope.currentFloor = a;
                break;
            }
        }  
        
    };
    
    
    
    
});