pokemonApp.service('pokeMap', function() {

    
    
});


// Game Service (game state, game logic and game loop)
pokemonApp.service('pokeGame', function($log, $interval, pokeMap) {

    // Initialize a new Game object
    var game = new Game();
    
    game.initGame();
    
    game.drawMap(); 
    
    game.drawPlayer();
    
    game.map.initGameboy();
    
    
    
    // Attach game object to pokeGame service
    this.game = game;
    
    console.log(game.map);
    
    //game.ticks = 0;
    //game.FPS = 60;
    //game.DIRECTION = null;
    //game.GENDER = 'BOY';
    
    
//    game.map = map;
//    game.graph = graph;
//    
//    // Attach game to different components of the game
//    var map = pokeMap.map;
//    map.game = game;
//    map.sprite.game = game;
//    
//    var graph = pokeMap.graph;
//    
    
    //var game = this;
    //$log.log('armin van buuren');
    
//    // Create Pathfinder
//    this.pathfinder = new Pathfinder(map);
//    var pathfinder = this.pathfinder;
    
    this.findPath = function() {
        
        
        var entrance = game.map.keyTiles[0].tile;
        var mewtwo = game.map.keyTiles[1].tile;
        
        console.log(entrance);
        console.log(mewtwo);
        
        var source = entrance.id;
        var target = mewtwo.id;
        
        var path = game.pathfinder.bfs(source, target);
        //console.log(path);
        
        //game.GAME_STATE = 'PATHFINDING';
        //game.pathfinder.index = 0;
        //game.index = 0;
        
    };
       
    //game.pathfinder.PATH_STATE = 'VISUALIZE';
    //this.findPath();
        
    
    // Game Loop
    var gameLoop = function() {
        
        let start_time = performance.now();
       
        // ----- Update game ----- //
        
        //map.pathVisualization();
        
        game.updatePathfinder();
        game.updatePlayer();

        //map.updatePath(game);
        // Update rocks
        // Update water
        //map.updateDivs();
    
    
        // ----- Render game ----- //
        
        // Draw Map
        game.drawMap();    
        
        // Draw highlighted tile
        game.drawHoverTile();
        
        // Draw path
        //game.drawPath();
        
        // Draw player
        game.drawPlayer();
        
        // Draw overlay
        //game.drawOverlay();
        
        // Draw transition
        game.drawTransition();
        
        game.map.drawGameboy(game.player);
        
        //map.drawGameboy();
        game.ticks++;
        //console.log(game.ticks);
        let end_time = performance.now();
        //$log.log('Loop Time: ' +  (end_time - start_time))
        
    };
    
    $interval(gameLoop, 1000/game.FPS);
    
    
    
    
//    $log.log('hello world');
//    

//
//    // Aquire map variable
//    var map = pokeMap.map;
//    
//    // Initialize game
//    var sprite = new Sprite();
//    sprite.init(map.tile_size);
//    //sprite.dropTile(map, 21, 33);
//    
//    map.createRowsCols();
//    //map.createEdges();
//    map.createTileBackground();
//    //map.createTileRockBackground();
//    map.createBitmapBackground();
//    
//    map.sprite = sprite;
//    
//    map.drawBitmapBackground();
//    //map.drawTileBackground();
////    map.drawRowsCols();
////    map.followPath();
////    map.drawSprite(sprite);     
////    
//    var time = {}
//    var ticks = 0
//    
//    var that = this;
//    
//    // Define game loop
//    var gameLoop = function() {
//        ticks += 1
//        
//        $log.info('Game is running');
//                
//        
//        var current_time = new Date();
//                  
//        map.drawTileBackground();
//        //map.drawBitmapBackground();
//        map.drawRowsCols();
//        
//        if (ticks % 1 == 0) {
//            map.followPath();
//        }
//        
//        map.lerpMove();
//        //map.drawEdges();
//        
//        // Update sprite's location if it's currently moving
//        
//        
//        
//        
//        
////        // 1. Auto move sprite if path isn't empty
////        map.autoMove(sprite);
////        
////        // 2. Lerp sprite if sprite is currently moving
////        map.lerpSprite(sprite);
////        
////        // 3. Draw sprite
//          map.drawSprite(); 
//        //console.log(this);  
//        that.updateGameboy();
//        
//    }
//    
//    // Initiate game loop
//    //$interval(gameLoop, 1000/FPS);
//    
//    
//    
//    
//    this.drawPath = function(path) {
//        map.path = path;
//        map.path.index = 0;
//        
//        //map.drawPath(sprite, path);
//    }
//    

    
    
    
    
});
