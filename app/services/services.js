pokemonApp.service('pokeMap', function() {
   
    // Create Floor object objects
    var F1 = new Floor(F1_data);    
    var F2 = new Floor(F2_data);
    var BF1 = new Floor(BF1_data);
    
    // Apply tile data
    F1.updateTiles();
    F2.updateTiles();
    BF1.updateTiles();
    
    // Create game map
    this.map = new Map(map_data);
    
    // Add floors to map
    this.map.addFloor(F1);
    this.map.addFloor(F2);
    this.map.addFloor(BF1);
    
    // Add ladders data to map
    this.map.updateLadders();
    
    // Add map data to map
    this.map.updateMap();
    
    console.log(this.map);
    
    // Create game graph
    this.graph = new Graph();
    
    // Add map to graph
    this.map.updateGraph(this.graph);
    console.log(Object.keys(this.graph.adj).length);
    
    // Create map layers
    this.map.createMapLayers(this.graph);
    
    // Create sprite
    this.map.initSprite();
    //this.map.drawSprite();
    
    // Define initial state
    this.map.LAYER_STATE === 'BITMAP';
    this.map.ROWSCOLS_STATE === 'OFF';
    
    // Create gameboy
    this.map.initGameboy();
    this.map.drawGameboy();
    
    
});


// Game Service (game state, game logic and game loop)
pokemonApp.service('pokeGame', function($log, $interval, pokeMap) {

    // Initialize a new Game object
    var game = new Game();
    game.FPS = 60;
    game.DIRECTION = null;
    game.GENDER = 'BOY';
    game.ticks = 0;
    
    // Attach game to different components of the game
    var map = pokeMap.map;
    map.game = game;
    map.sprite.game = game;
    
    
    //var game = this;
    //$log.log('armin van buuren');
    
    
    
    
    // Game Loop
    var gameLoop = function() {
        

        
        // ----- Update game ----- //
        
        map.updateSprite(game);
    
    
        // ----- Render game ----- //
        
        // Draw canvas
        if (map.LAYER_STATE === 'BITMAP') {
            map.drawBitmapLayers();
        } else if (map.LAYER_STATE === 'GRAPHIC') {
            map.drawGraphicLayers();
        }

        // Draw rows/cols
        if (map.ROWSCOLS_STATE === 'ON') {
            map.drawGraphicRowsCols();   
        }

        // Draw sprite
        map.drawSprite();
        map.drawMapTransitionLayer();
        
        map.drawGameboy();
        game.ticks++;
        
    };
    
    $interval(gameLoop, 1000/game.FPS);
    
    this.game = game;
    
    
    
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
