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
    
    // Draw map
    this.map.drawMap(this.graph);
    
    
});


// Create graph
pokemonApp.service('pokeGraph', function(pokeMap) {
    
    //console.log('sup doc');
    
    
    
    // Add floors tograph
    
//    //var _1F_tiles = _1F_data();
//    _1F.updateTiles(_1F_tiles);
//    
//    this.floor = _1F;
//
//    // Add 1st Floor data to graph
//    _1F.updateGraph(_1F_tiles, this.graph);
//    
//    // Initialize canvas
//    _1F.initCanvas('floor-1F');
//    
//    //_1F.drawGrid();
//    //_1F.drawRowsCols();
//
//    //_1F.drawSprite(sprite, 20, 32);
//    
//    // Create Floor Canvas Object
//    //_1F_draw = new DrawFloor(_1F, 570, 315)
//    // Construct path
//    //var path = pathfinding.bfs(graph, source, target);
//    

     
});


// Game loop
pokemonApp.service('pokeGame', function($log, $interval, pokeMap) {
    
//    $log.log('hello world');
//    
//    // FPS for game
//    var FPS = 60;    
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
