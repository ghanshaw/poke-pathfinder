// Create graph
pokemonApp.service('pokeGraph', function() {
    
    //console.log('sup doc');
    
    // Create game graph
    this.graph = new Graph();
    
    
    // Create Floor object to represent 1st Floor
    var _1F = new Floor('1F', 21, 38);
    var _1F_tiles = _1F_data();
    _1F.updateTiles(_1F_tiles);
    
    this.floor = _1F;

    // Add 1st Floor data to graph
    _1F.updateGraph(_1F_tiles, this.graph);
    
    // Initialize canvas
    _1F.initCanvas('floor-1F');
    
    //_1F.drawGrid();
    //_1F.drawRowsCols();

    //_1F.drawSprite(sprite, 20, 32);
    
    // Create Floor Canvas Object
    //_1F_draw = new DrawFloor(_1F, 570, 315)
    // Construct path
    //var path = pathfinding.bfs(graph, source, target);
    

     
});


// Game loop
pokemonApp.service('pokeGame', function($log, $interval, pokeGraph) {
    
    $log.log('hello world');
    
    // FPS for game
    var FPS = 60;    

    // Aquire map variable
    var map = pokeGraph.floor;
    
    // Initialize game
    var sprite = new Sprite();
    sprite.init(map.tile_size);
    sprite.dropTile(map, 20, 32);
    
    map.createRowsCols();
    //map.createEdges();
    map.createTileBackground();
    
    
    map.drawTileBackground();
    map.drawRowsCols();
    map.drawSprite(sprite);     
    
    
    
    
    // Define game loop
    var gameLoop = function() {
        
        $log.info('Game is running');
        map.drawTileBackground();
        map.drawRowsCols();
        //map.drawEdges();
        map.drawSprite(sprite);       
        
    }
    
    // Initiate game loop
    $interval(gameLoop, 1000/FPS);
    
    
    
    
    this.drawPath = function(path) {
        map.drawPath(sprite, path);
    }
    
    this.keyTiles = [
        { 
            id: 0,
            name: 'Entrance',
            floor: '1F',
            tile: [20, 32]
        },
        { 
            id: 1,
            name: 'Mewtwo',
            floor: 'BF1',
            tile: [10, 4]
            
        },
    ]
    
    
    
    
});
