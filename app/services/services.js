// Game Service (game state, game logic and game loop)
pokemonApp.service('pokeGame', function($log, $document, $window, $location, $timeout, $interval) {
    
    this.cancelDirection = function(event) {
        var keyCode = event.keyCode;
        if (game.keyCode === keyCode) {
            $log.log('no longer pressing down');
            $log.log(event);        
            game.KEYPRESS = null;
        }
    };
    
    this.changeDirection = function(event) {
        $log.log(event);      
        var keyCode = event.keyCode;
        game.keyCode = keyCode;
        
        switch(keyCode) {
            case 37:
                // Left arrow
                $log.log('left arrow');
                event.preventDefault();
                game.KEYPRESS = 'LEFT';
                
                //map.moveSprite('left');
                break;
            case 38:
                // Up arrow
                $log.log('up arrow');
                event.preventDefault();
                game.KEYPRESS = 'UP';
                //map.moveSprite('up');
                
                break;
            case 39:
                // Right arrow
                $log.log('right arrow');
                event.preventDefault();
                game.KEYPRESS = 'RIGHT';
                //map.moveSprite('right');
                break;
            
            case 40:
                // Down arrow
                $log.log('down arrow');
                event.preventDefault();
                game.KEYPRESS = 'DOWN';
                //map.moveSprite('down');
                break;
        }
        
        //$scope.spriteTile = map.sprite.tile;
        
        
    };
    
    $(document).keydown(this.changeDirection);
    $(document).keyup(this.cancelDirection);
    
    
    // $window.onload(function() {
    
    
    
    // })

        // Initialize a new Game object
        var game = new Game();
        game.initGame();
    
    this.userConsole = game.userConsole;
    
    // Attach game object to pokeGame service
        this.game = game;
    
    this.setView = function(view) {
            game.setView(view);
        };
    
    var that = this;
    
    console.log($window);
  
  var spritesheet = document.getElementById('spritesheet-color');

//  spritesheet.onload = function() {
//      alert('trigger already!');
//  };
//  
//  $('#spritesheet-color').on('load', function() {
//      alert('finally!');
//  });
    
    angular.element(document).ready(function () {
   // angular.element($window).on('load', function() {   
    
    //$('.image-files').on('oad = function() {   
        
        
        
        console.log(game.map);
        
        //this.settings = userConsole.getSettings();
        
        
        
        
        var userConsoleScope = angular.element('.user-console-wrapper').scope();
        
        console.log('User Console Scope is...')
        console.log(userConsoleScope);
        
        //    //wrap changes in an apply call to make sure view and model are consistent
        //    scope.$apply(function() {
        //        scope.object.data = value;
        //    });
        
        
        
        // Run game loop
        var gameLoop = function() {
            
            if (that.viewLoaded) { 
                
                let start_time = performance.now();
                
                //$log.log($location.path());
                
                // ----- Update game ----- // 
                game.userConsole.updateSettings();
                if (userConsoleScope) {
                    userConsoleScope.$apply();
                }
                //that.setttings = userConsole.getSettings();
                
                game.updateGame();
                
                let post_update_game = performance.now();
                
                //        console.time('updateMap');  
                game.updateMap();
                //        console.timeEnd('updateMap');
                let post_update_map = performance.now();
                
                // ----- Render game ----- //
                
                
                var currentPath = $location.path();
                //game.renderGame(currentPath);
                
                let post_render_game = performance.now();
                
                
                //        
                //        // Draw Map
                //        game.drawMap();   
                //        //game.renderGame();
                //        
                //        // Draw highlighted tile
                //        //game.drawHoverTile();
                //        
                //        game.drawFlags();
                //        
                //        // Draw path
                //        //game.drawPath();
                //        
                //        // Draw player
                //        //game.drawPlayer();
                //        
                //        // Draw special tiles
                //        game.drawSpecial();
                //        // Draw overlay
                //        //game.drawOverlay();
                //        
                //        // Draw transition
                //        game.drawTransition();
                
                //game.map.drawGameboy(game.player);
                
                //map.drawGameboy();
                game.ticks++;
                //console.log(game.ticks);
                let end_time = performance.now();
                
                var time = {
                    post_update_game: post_update_game - start_time,
                    post_update_map: post_update_map - post_update_game,
                    post_render_game: post_render_game - post_update_game,
                    total_time: end_time - start_time
                };
                
                
                let total_time = end_time - start_time;
                if (total_time > 6) {
                    //$log.info('Loop Time is over 6ms ' + total_time);
                }
                //        $log.log(time);
                //$log.log('Loop Time: ' +  time.total_time);
                //console.log(game.pathfinder.PATH_STATE);
            }
            
            window.requestAnimationFrame(gameLoop);
        };
        
        //gameLoop();
        window.requestAnimationFrame(gameLoop);
        
        //$interval(gameLoop, 1000/game.FPS);  
        
    });
    //};
});


//pokemonApp.service('userConsole', function($log, $document, $location, $interval) {
//  
//    
//    
//});