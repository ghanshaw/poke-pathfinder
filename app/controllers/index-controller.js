pokemonApp.controller('indexController', function($scope, $log, $location, $window, pokeGame) {  
    
    
    var userConsole = pokeGame.userConsole;
    
    /* -------------------- //
    Prevent scrolling
    // -------------------- */
    
    $scope.interface = userConsole.interface;
    
    
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
    
    
   
    
    $scope.toggleAbout = function() {
        
        var status = $scope.about.visible;
        $scope.about.visible = !status;
        
        $('html, body').toggleClass('no-scroll');
        
    };
    
    /* -------------------- //
    Side Panel
    // -------------------- */
    
    $scope.panel = {
        open: false
    };
    
    $scope.toggleSidePanel = function() {     
        var status = $scope.panel.open;
        $scope.panel.open = !status;
    };
    
    $scope.openSidePanel = function(bool) {
        $scope.panel.open = bool;
    };

    $scope.cssSidePanel = function() {
        return { 
            'panel-open': $scope.panel.open,
            'panel-closed': !$scope.panel.open  
        };
    }; 
    

    /* -------------------- //
    View Switcher
    // -------------------- */
    
    $scope.view;

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
        } else {
            $location.path('/monitor/');
        }
        
    };
    
    $scope.$watch('view', function(newValue, oldValue) {
        pokeGame.setView(newValue);        
    });
    
    
    
    $scope.viewswitcher = {
        visible: false
    };
    
    $scope.updateView = function() {
        
        $scope.view;
        var path = $location.path();
	
        var screenWidth = $window.innerWidth;
        
        if (screenWidth < $scope.breakpoints.sm) {
            $scope.hideMonitor = true;
            if ($scope.view !== 'gameboy') {
                $scope.view = 'gameboy';
                $scope.switchViews();
                
            } 
            
            $scope.viewswitcher.visible = false;
        } else {
            $scope.viewswitcher.visible = true;
        }
        
    };
    
    $scope.updateView();
    
    
    var appWindow = angular.element($window);
    
    appWindow.bind('resize', function () {
        
        $scope.updateView();      
        $scope.$apply(); 
        
    });
    
    
});