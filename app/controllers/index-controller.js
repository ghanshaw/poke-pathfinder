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
    
      
//    $window.onload = function() {
//        alert("Angularjs call function on page load");
//    };
    
    
   
    
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
    How To Box
    // -------------------- */
    
    $scope.howto = {
        show: false,
    };
    
    $scope.toggleHowTo = function() {
        $scope.howto.show = !$scope.howto.show;
    };
    

    /* -------------------- //
    View Switcher
    // -------------------- */
    
    $scope.view;

    var path = $location.path();
    if (path === '/monitor/') {
        $scope.view = 'monitor';
    } else {
        $scope.view = 'gameboy';
        console.log(path);
        console.log('THE VIEW IS DEFIEND HERE');
        
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
        console.log('SETTING THE VIEW!');
        console.log($scope.view);
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
            $scope.hideMonitor = false;
            $scope.viewswitcher.visible = true;
        }
        
    };
    
    $scope.links = {
        mulani: 'https://medium.com/@mmmulani/creating-a-game-size-world-map-of-pok%C3%A9mon-fire-red-614da729476a',
        sprites_resource: 'https://www.spriters-resource.com/',
        gameboy: 'https://codepen.io/joshuajcollinsworth/'
    };
    
    $scope.updateView();
    
    
    var appWindow = angular.element($window);
    
    appWindow.bind('resize', function () {
        console.log('window  resizing');
        $scope.updateView();      
        $scope.$apply(); 
        
    });
    
    $scope.enableScrollEffect = function() {
        
//        var aboutparent = {};
//        aboutparent.element = angular.element('.about .parent');
//        aboutparent.width = aboutparent.element.width();
//        aboutparent.height = aboutparent.element.height();
//        
        var about = {
            parent: {},
            content:{}
        };
        
        about.parent.elem = angular.element('.about .parent');
        about.content.elem = angular.element('.about .content');
        
        
        $(about.parent.elem).on('scroll', function() {
            
            var content = about.content;
            var parent = about.parent;
            
            parent.width = parent.elem.width();
            parent.height = parent.elem.height();

            var scrollTop = parent.elem.scrollTop();
          
            content.height = content.elem.height();
            content.width = content.elem.width();
            
            //var percent = scrollTop/(content.height - parent.height) * content.height;
            
            var percent = scrollTop/(content.height - parent.height);
//            percent *= 100;
//            percent = Math.round(percent);
            
            var x = (percent) * parent.width;
            var y = percent * parent.height;
            
            var translate = 'translate( ' + -x + 'px, ' + y * 1.3 + 'px)';
            console.log(translate);
            
            $('.pokeball img').css('transform', translate);
//            $('.pokeball.wrapper').css('right', percent + '%');
//            $('.pokeball.wrapper').css('top', percent + '%');
            
            console.log('Percent through page');
            console.log(percent);
            
            
        });
        
        //$scope.aboutparent = aboutparent;
        
        
    }
    
    
    
    //appWindow.resize();
    
    
});