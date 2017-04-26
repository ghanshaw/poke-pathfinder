// Game Service (game state, game logic and game loop)
pokemonApp.service('pokeGame', function($log, $document, $location, $interval) {
    
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

        // Attach game object to pokeGame service
        this.game = game;
        
        console.log(game.map);
        
    
    // Run game loop
    var gameLoop = function() {
        
        let start_time = performance.now();
        
        
        
        //$log.log($location.path());
       
        // ----- Update game ----- // 
          
        game.updateGame();

        let post_update_game = performance.now();

        console.time('updateMap');  
        game.updateMap();
        console.timeEnd('updateMap');
        let post_update_map = performance.now();

        // ----- Render game ----- //
         
         
         var currentPath = $location.path();
        game.renderGame(currentPath);

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
        }


        let total_time = end_time - start_time;
        if (total_time > 6) {
            //$log.info('Loop Time is over 6ms ' + total_time);
        }
        $log.log(time);
        $log.log('Loop Time: ' +  time.total_time);
        
    };
    
     $interval(gameLoop, 1000/game.FPS);  
    
    
});
