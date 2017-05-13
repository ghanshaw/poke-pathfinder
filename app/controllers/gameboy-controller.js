pokemonApp.controller('gameboyController', function($scope, $log, $window, $document, pokeGame) { 
    
    // Aquire Game objects
    var game = pokeGame.game;
    var userConsole = pokeGame.userConsole;
    
    // Initialize Gameboy
    var gameboy = game.gameboy;
    gameboy.init();
    gameboy.resize();
    
    /* -------------------- //
    Event handlers
    // -------------------- */
    
    // When document has loaded
    angular.element(document).ready(function() { 
        $scope.defineDpadTouchTarget(); 
        pokeGame.viewLoaded = true;
    });    
    
    // On resize
    var appWindow = angular.element($window);
    appWindow.bind('resize', function () {
        var view = game.getView();
        
        if (view === 'gameboy') {
            gameboy.resize();
            $scope.defineDpadTouchTarget();       
        }
    });
    
    // On orientation change
    window.addEventListener("orientationchange", function() {
        gameboy.resize();
        $scope.defineDpadTouchTarget();
    }, false);
   
    
    /* -------------------- //
    Wait overlay
    // -------------------- */
    
    // Show wait screen when pathfinder is in Frontier Mode
    $scope.showWaitOverlay = function() {
        return game.getPathfinderMode() === 'FRONTIER';
    };
    
    
    /* -------------------- //
    Handle d-pad interaction
    // -------------------- */
    
    
    // Define the touch target as it exists in DOM
    $scope.defineDpadTouchTarget = function() {
        
        // Get touch targets from DOM
        var a_button = {};
        a_button.element = $('.a-button.touch-target');
        
        var b_button = {};
        b_button.element = $('.b-button.touch-target');
        
        var d_pad = {}; 
        d_pad.element = $('.d-pad.touch-target');

        // Measure d-pad touch target
        d_pad.offset = $('.d-pad.touch-target').offset();
        d_pad.width = $('.d-pad.touch-target').width();
        d_pad.height = $('.d-pad.touch-target').height();
        
        // Define origin of touch "circle" on page
        var origin = {};
        origin.x = d_pad.offset.left + d_pad.width/2;
        origin.y = d_pad.offset.top + d_pad.height/2;
        d_pad.origin = origin;
        
        // Attach touch targets to scope
        $scope.touch_targets = {
            a_button: a_button,
            b_button: b_button,
            d_pad: d_pad
        };
        
    };
    
    // Object storing d-pad direction
    $scope.dpad = {
        direction: null
    };   
    
    // Control CSS of d-pad
    $scope.cssdpad = function() {
        
        var dpad = $scope.dpad;
        
        var css = {
            'press-left': dpad.direction === 'LEFT',
            'press-right': dpad.direction === 'RIGHT',
            'press-up': dpad.direction === 'UP',
            'press-down': dpad.direction === 'DOWN'
        };
        
        return css;
    };
    
    
    
    
    // Store interaction details
    $scope.interaction = {
        x: 0,
        y: 0,
        pressing: false      
    };
    
    
    // Handle mouse down on d-pad
    $scope.mouseDownDpad = function(event) {
        var interaction = $scope.interaction;
        
        interaction.x = event.pageX;
        interaction.y = event.pageY;
        interaction.pressing = true;
        
        $scope.handleDpadInteraction();
    };
    
    $scope.mouseMoveDpad = function(event) {
        
        var interaction = $scope.interaction;
        
        // If user is already pressing
        if (interaction.pressing) {
            interaction.x = event.pageX;
            interaction.y = event.pageY;
            $scope.handleDpadInteraction();
        }
        
    };
    
    // Handle mouse down on d-pad
    $scope.mouseLeaveDpad = function(event) {
        
        var interaction = $scope.interaction;
        interaction.pressing = false;
        $scope.handleDpadInteraction();
        
    };
    
    
    // Handle mouse up on d-pad
    $scope.mouseUpDpad = function(event) {
        
        var interaction = $scope.interaction;
        
        interaction.x = event.pageX;
        interaction.y = event.pageY;
        
        interaction.pressing = false;
        $scope.handleDpadInteraction(interaction);
  
    };
    
    // Handle touch start on d-pad
    $scope.touchStartDpad = function() {
        console.log('started touching');
        var touches = $scope.touchstart.originalEvent.touches;
        $scope.touchMoveDpad(touches); 
    };
    
    // Handle touch move on d-pad
    $scope.touchMoveDpad = function(touches) {       
        var interaction = $scope.interaction;    
        
        // Check if any of touches intersects with the d-pad touch-target
        // Either get touches from arguments, or from touchmove objects
        touches = touches || $scope.touchmove.originalEvent.touches;
        
        // Get d-pad touch target
        var touch_target = $scope.touch_targets.d_pad;
        
        for (let i = 0; i < touches.length; i++) {         
            var touch = touches[i];
            if ($(touch.target).is(touch_target.element)) {
                
                // Update the interaction and handle it
                interaction.x = touch.pageX;
                interaction.y = touch.pageY;
                interaction.pressing = true;
                $scope.handleDpadInteraction();
            }
        } 
    };
    
    // Handle touch end on d-pad
    $scope.touchEndDpad = function() {
        var interaction = $scope.interaction;
        interaction.pressing = false;
        $scope.handleDpadInteraction();
    };

    // Get angle based on coordinates using Unit Cirlce trig
    $scope.getTheta = function(x, y, radius) {
        
        var x2 = Math.pow(x, 2);
        var y2 = Math.pow(y, 2);
        
        var r2 = x2 + y2;
        var r = Math.pow(r2, .5);
        
        // Don't process if radius is too larget
        if (r <= radius) {
            var theta = {};
            theta.x = Math.acos(x/r);
            theta.y = Math.asin(y/r);
            return theta;
        } else {
            return null;
        } 
        
    };
    
    // Handle interaction from either mouse or touch
    $scope.handleDpadInteraction = function(interaction) {
        
        // Interaction is either a touch or a click
        // Interaction coordinates are page coordinates
        var interaction = $scope.interaction;

        // Get d-pad touch target
        var touch_target = $scope.touch_targets.d_pad;
        
        /* The function takes touches and clicks on the touch-target div
         * and interprets them as lying on an imaginary circle defined within the div.
         * The circle is divided into four sections (like a pie rotated 45deg) and the move is defined
         * based on the location of that interaction within the imaginary circle
         */
        
        // Cooridinates of interaction in relation to origin (center of touch target)
        var x = interaction.x - touch_target.origin.x;
        var y = touch_target.origin.y - interaction.y;
        
        // Get angle of user interaction in relation to origin
        var radius = touch_target.width;
        var theta = $scope.getTheta(x, y, radius);
        
        // If theta is defined, compute angle
        if (theta) { 
            
            // Convert angle to degrees
            var deg = 180/Math.PI;
            theta.x *= deg;
            theta.y *= deg;
            
            // Determine quadrant of interaction
            var angle;
            // Quadrants 1, and 2
            if (y >= 0) {
                angle = theta.x;
            } 
            // Quadrant 3
            else if (x <= 0) {
                angle = Math.abs(theta.y) + 180;
            } 
            // Quadrant 4
            else {
                angle = 360 + theta.y;
            }
            
            var input;
            // Extract input based on angle
            
            if (angle >= 45 && angle < 135) {
                input = 'UP';
            }
            else if (angle >= 135 && angle < 225) {
                input = 'LEFT';
            }
            else if (angle >= 225 && angle < 315) {
                input = 'DOWN';
            }
            else if (angle >= 315 || angle < 45) {
                input = 'RIGHT'; 
            }
        } 
        // Otherwise invalidate interaction
        else {
            interaction.pressing = false;
        }
        
        // If user is 'pressing'
        if (interaction.pressing) {
            // Send input to User Console
            userConsole.handleKeyboardGamepadInput(input);
            
            // Update css variable to reflect change
            $scope.dpad.direction = input;
        }
        else {
            // Send input to User Console
            userConsole.cancelKeyboardGamepadInput(null);
            $scope.dpad.direction = null;
        }
        
        return;
    };
    
    /* -------------------- //
    Handle A/B Button Interaction
    // -------------------- */
    
    // Control CSS of A/B Buttons;
    $scope.ab = {
        a: false,
        b: false
    };
    
    // Handle mouse down on A/B buttons
    $scope.mouseDownAB = function(button) {
        if (button === 'A') {
            $scope.ab.a = true;
            userConsole.toggleGender();
        }
        
        if (button === 'B') {
            userConsole.holdSpeedButton(2);
            $scope.ab.b = true;
        }
    };
    
    // Handle mouse leave on A/B buttons
    $scope.mouseLeaveAB = function(button) {
        if (button === 'A') {
            $scope.ab.a = false;
        }      
        if (button === 'B') {          
            userConsole.holdSpeedButton(null);
            $scope.ab.b = false;
        }  
    };
    
    // Handle mouse up on A/B buttons
    $scope.mouseUpAB = function(button) {
        if (button === 'A') {
            $scope.ab.a = false; 
        }
        
        if (button === 'B') {
            userConsole.holdSpeedButton(null);
            $scope.ab.b = false;
        }
    };
    
    // Handle touch start on A/B
    $scope.touchStartAB = function(button) {
        $scope.mouseDownAB(button);
    };
    
    // Handle touch leave on A/B
    $scope.touchLeaveAB = function(button) {
        $scope.mouseUpAB(button);
    };
    
    // Handle touch end on A/B
    $scope.touchEndAB = function(button) {
        $scope.mouseUpAB(button);
    };
    
});