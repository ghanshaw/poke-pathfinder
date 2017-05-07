pokemonApp.controller('gameboyController', function($scope, $log, $window, $document, pokeGame) { 
    
    var userConsole = pokeGame.userConsole;
    
    angular.element(document).ready(function () {
        
        var game = pokeGame.game;
        var gameboy = game.gameboy;
        
        gameboy.init();
        gameboy.resize();
        
        var appWindow = angular.element($window);
        
        appWindow.bind('resize', function () {
            console.log('resizing');
            gameboy.resize();
        });
        
        pokeGame.viewLoaded = true;
        
    });
    
    $scope.gameboy = userConsole.interface.gameboy;
    
    
    $scope.toggleLock = function() {
        var status = $scope.gameboy.locked;
        $scope.gameboy.locked = !status;
    };
    
//    $scope.touchMe = function($event) {
//        console.log("I'm being touched!");
//        console.log($event);
//    };
    
    $scope.touched = false;
    
    $scope.touchStartDpad = function(direction) {
        console.log('Just touched the ' + direction + ' button.');
        $scope.pressdpad(direction);
    };
    
    $scope.touchMoveDpad = function() {
        
        console.log("Looking for overlap");
        
        //console.info("I'm moving");
        //console.info($scope.touchevent);  
        
        // Check if touch intersects iwth any of the targets
        var touches = $scope.touchevent.originalEvent.touches;
//        console.log(touches);
//        console.log(Array.isArray(touches));
        
        for (let i = 0; i < touches.length; i++) {
            
            // Check if any of touches corresponds with a direction
            
            var touch = touches[i];
            
            var touchX = touch.pageX;
            var touchY = touch.pageY;
            
            console.log(touch);
            
            var touch_target = {};
            
            touch_target.element = $('.touch-target');
            
            // Define origin of "circle";
            touch_target.offset = $('.touch-target').offset();
            touch_target.width = $('.touch-target').width();
            touch_target.height = $('.touch-target').height();
            
            var origin = {};
            origin.x = touch_target.offset.left + touch_target.width/2;
            origin.y = touch_target.offset.top + touch_target.height/2;
            
            
            
            // Cooridinates in relation to origin (center of touch target)
            var x = touchX - origin.x;
            var y = origin.y - touchY;
            
            console.log(x, y);
            
            var theta = $scope.getTheta(x, y, touch_target.width/2);
            
            if (!theta) { continue; }
            
            console.log('I have an angle');
            
            // Convert angle to degrees
            var deg = 180/Math.PI;
            theta.x *= deg;
            theta.y *= deg;
            //console.log(theta.x * deg, theta.y * deg);
            
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
            
            
            //angle -= 45;
            console.log('Angle is: ' + angle);
            
            var direction;
            // Extract direction from angle
            if (angle >= 45 && angle < 135) {
                direction = 'UP';
            }
            else if (angle >= 135 && angle < 225) {
                direction = 'LEFT';
            }
            else if (angle >= 225 && angle < 315) {
                direction = 'DOWN';
            }
            else if (angle >= 315 || angle < 45) {
                direction = 'RIGHT'; 
            }
            
            $scope.pressdpad(direction);
            return;
            
            //console.log(origin);
            
            
            
            var targets = [$(".d-pad-target.up"), $(".d-pad-target.down"), $(".d-pad-target.left"), $(".d-pad-target.right")];
            var direction = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
            
            
            
            var j = 0;
            for (let t of targets) {   
                
                var offset = t.offset();
                var width = t.width();
                var height = t.height();
                
                if (touchY > offset.top &&
                        touchY < offset.top + height &&
                        touchX > offset.left &&
                        touchX < offset.left + width) {
                    //console.log(t);
                    break;
                }
                j++;
            }
            
            if (j < 4) {
                console.log('My touch overlaps with: ' + direction[j]);
                $scope.pressdpad(direction[j]);   
            } else {
                console.log('Touch did not overlap');
                console.log({ touchX: touchX, touchY: touchY });
            }
        }       
    };
    
    
    
    
    
    $scope.getTheta = function(x, y, radius) {
        
        var x2 = Math.pow(x, 2);
        var y2 = Math.pow(y, 2);
        
        var r2 = x2 + y2;
        var r = Math.pow(r2, .5);
        
       
        
        if (r <= radius) {
            var theta = {};
             theta.x = Math.acos(x/r);
             theta.y = Math.asin(y/r);
             return theta;
        } else {
            return null;
        } 
        

    };
    
    $scope.touchEndDpad = function() {
        console.log("Stopped touching dpad.");
        $scope.releasedpad();
    };
    
    $scope.dpad = {
        direction: null
    };
    
    $scope.pressdpad = function(direction) {
        
        //$scope.dpad.direction = direction;
        console.log('Pressing in the ' + direction + ' direction.');
        
        //$scope.touched = true;
        
        var dpad = $scope.dpad;
        
        if (direction === 'LEFT') {
            dpad.direction = 'LEFT';
            //userConsole.pressDpad();
            pokeGame.game.KEYPRESS = 'LEFT';
        }
        
        else if (direction === 'RIGHT') {
            dpad.right = true;
            dpad.direction = 'RIGHT';
            pokeGame.game.KEYPRESS = 'RIGHT';
        }
        
        else if (direction === 'UP') {
            dpad.up = true;
            dpad.direction = 'UP';
            pokeGame.game.KEYPRESS = 'UP';
        }
        
        else if (direction === 'DOWN') {
            dpad.down = true;
            dpad.direction = 'DOWN';
            pokeGame.game.KEYPRESS = 'DOWN';
        }
        
        
        
        //        console.log('pressing dpad');
        //        $scope.dpad.down = true;
        
    };
    
    $scope.releasedpad = function(direction) {
        
        //$scope.touched = false;
        $scope.dpad.direction = null;
        pokeGame.game.KEYPRESS = null;
        return; 
        
    };
    
    $scope.cssdpad = function(direction) {
        
        var dpad = $scope.dpad;
        
        var css = {
            'press-left': dpad.direction === 'LEFT',
            'press-right': dpad.direction === 'RIGHT',
            'press-up': dpad.direction === 'UP',
            'press-down': dpad.direction === 'DOWN'
        };
        
        return css;
    };
    
    $scope.ab = {
        a: false,
        b: false
    };
    
    $scope.touchStartAB = function(button) {
        console.log('Touched ' + button + ' button.');
        $scope.pressAB(button);
    };
    
    $scope.touchEndAB = function(button) {
        console.log('Finished touching ' + button + ' button.');
        $scope.releaseAB(button);
    };
    
    
    $scope.pressAB = function(button) {
        if (button === 'A') {
            //game.setSpeed('')
            $scope.ab.a = true;
            userConsole.toggleGender();
            
            //userConsole.toggleSpeed();
        }
        
        if (button === 'B') {
            console.log('Pressing B Button.');
            userConsole.holdSpeedButton(2);
            $scope.ab.b = true;
        }
    };
    
    $scope.releaseAB = function(button) {
        if (button === 'A') {
            //game.setSpeed('')
            $scope.ab.a = false;
        }
        
        if (button === 'B') {
            console.log('Released B Button.');
            userConsole.holdSpeedButton(null);
            $scope.ab.b = false;
        }
    };
    
    
    
    
    
    console.log('the gameboy scope: ')
    console.log($scope);
    
    //    
    //    
    //    
    //    // Controller (re-)initializes the canvas  
    //    gameboy.initCanvas();
    //    gameboy.createGameboyBackground();
    //    gameboy.createGrid();
    
});