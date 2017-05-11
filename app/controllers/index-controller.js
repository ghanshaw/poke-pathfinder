pokemonApp.controller('indexController', function($scope, $log, $location, $window, $document, pokeGame) {  
    
    $log.info('*** Index controller has begun.'); 
    var userConsole = pokeGame.userConsole;
    
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
        show: false
    };
    
    $scope.toggleHowTo = function() {
        $scope.howto.show = !$scope.howto.show;
    };
    
    /* -------------------- //
    View Switcher
    // -------------------- */
    
    $scope.view;
    
    // Get initial view on load
    var path = $location.path();
    if (path === '/monitor/') {
        $scope.view = 'monitor';
    } else {
        $scope.view = 'gameboy';        
    }
    
    // Control visibility of view switcher
    $scope.viewswitcher = {
        visible: false
    };
    
    // Function to switch views
    $scope.switchViews = function() {
        
        pokeGame.viewLoaded = false;
        
        // Chang view in DOM when slider changes
        if ($scope.view === 'gameboy') {
            $location.path('/');
        } else {
            $location.path('/monitor/');
        }
        
    };
    
    // Watch for change in slider
    $scope.$watch('view', function(newValue, oldValue) {
        pokeGame.setView(newValue);        
    });
    
    // Change view and view switcher depending on window size
    $scope.updateView = function() {
        
        // Get window size
        var screenWidth = $window.innerWidth;
        
        // If window is small
        if (screenWidth < $scope.breakpoints.sm) {
            
            // Switch view to gameboy
            if ($scope.view !== 'gameboy') {
                $scope.view = 'gameboy';
                $scope.switchViews();
            } 
            
            // Hide view switcher
            $scope.viewswitcher.visible = false;
        } 
        // If window is not small
        else {
            // Show view switcher
            $scope.viewswitcher.visible = true;
        }     
    };
    
    // Breakpoints
    $scope.breakpoints = {
        sm: 768,
        md: 992,
        lg: 1200
    };
    
    // Update view when page initially loads
    $scope.updateView();
    
    /* -------------------- //
    Event handlers
    // -------------------- */
    
    // Udpate view when window is resized
    var appWindow = angular.element($window);
    appWindow.bind('resize', function () {
        $scope.updateView();      
        $scope.$apply(); 
        
    });
    
    
    /* -------------------- //
    About Page
    // -------------------- */
    
    // Control visibility of about page
    $scope.about = {
        visible: false
    };
    
    // Toggle visibility of about page
    $scope.toggleAbout = function() {
        
        var status = $scope.about.visible;
        $scope.about.visible = !status;
        
        $('html, body').toggleClass('no-scroll');
        
    };
    
    // Links for about page
    $scope.links = {
        mulani: 'https://medium.com/@mmmulani/creating-a-game-size-world-map-of-pok%C3%A9mon-fire-red-614da729476a',
        sprites_resource: 'https://www.spriters-resource.com/',
        gameboy: 'https://codepen.io/joshuajcollinsworth/'
    };
    
    // Enable scroll effect
    // Function is triggered by DOM
    $scope.enableScrollEffect = function() {
        
        // Get parent and content elements
        var about = {
            parent: {},
            content:{}
        };
        
        about.parent.elem = angular.element('.about .parent');
        about.content.elem = angular.element('.about .content');
        
        // Attach scroll event to parent element
        $(about.parent.elem).on('scroll', function() {
            
            var content = about.content;
            var parent = about.parent;
            
            // Get various DOM measurments
            parent.width = parent.elem.width();
            parent.height = parent.elem.height();
            parent.scrollTop = parent.elem.scrollTop();
                   
            content.height = content.elem.height();
            content.width = content.elem.width();
            
            // Get percentage scrolled from top
            var percent = parent.scrollTop/(content.height - parent.height);

            // Construct translate css attribute based on scroll
            var x = percent * parent.width;
            var y = percent * parent.height;
            var translate = 'translate( ' + -x + 'px, ' + y * 1.3 + 'px)';
            
            // Translate pokeball image
            $('.pokeball img').css('transform', translate);
            
        });      
    };
    
    /* -------------------- //
    Handle Keyboard Inputer
    // -------------------- */
       
    // Process keydown events 
    $scope.triggerKeyboardInput = function(event) {
        var keyCode = event.keyCode;
        var input = $scope.getInputValue(keyCode);
        userConsole.handleKeyboardGamepadInput(input);
    };
    
    // Process keyup events
    $scope.cancelKeyboardInput = function(event) {
        var keyCode = event.keyCode;
        var input = $scope.getInputValue(keyCode);
        userConsole.cancelKeyboardGamepadInput(input);       
    };
    
    // Determine key pressed
    $scope.getInputValue = function(keyCode) {
        
        var input = null;      
        
        switch(keyCode) {
            case 65:
                // A Key
                event.preventDefault();
                input = 'A';
                break;
            case 66:
                // B Key
                event.preventDefault();
                input = 'B';
                break;
            case 37:
                // Left Key
                event.preventDefault();
                input = 'LEFT';
                break;
            case 38:
                // Up Key
                event.preventDefault();
                input = 'UP';
                break;
            case 39:
                // Right Key
                event.preventDefault();
                input = 'RIGHT';
                break;            
            case 40:
                // Down Key
                event.preventDefault();
                input = 'DOWN';
                break;
        }
        
        return input;       
    };
    
    // Attach keydown/keyup events to document
    $document.keydown($scope.triggerKeyboardInput);
    $document.keyup($scope.cancelKeyboardInput);
    
    
});