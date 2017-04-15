var Game = function() {
    
    this.algorithm = null;
    this.FPS = 60;
    //this.state = 
    
    this.USER_INPUT = null;
    this.STATE = null;
    this.ticks = 0;
    
    this.GAME_STATE = 'NORMAL';
   
};

Game.prototype.initGame = function() {
    
    this.initMap();
    this.initGraph();
    this.initPlayer();
    this.initPathfinder();
    
};


Game.prototype.initPathfinder = function() {
  
    // Create new pathfinder
    this.pathfinder = new Pathfinder(this.graph);
    
    // Expose game to pathfinder
    this.pathfinder.game = this;
    
    // Create sprite and add visualization to floors
    this.pathfinder.initSprite();
    this.pathfinder.createPathfinderFloorLayers();
    
    console.log(this.pathfinder);
    
};


Game.prototype.initPlayer = function() {
    
    this.player = new Player();
    
    // Create player's shape and sprite representations
    this.player.initShape();
    this.player.initSprite();
    
    // Defne player's initial location
    var entrance = this.map.keyTiles[0].tile;
    this.player.setTile(entrance);
    
    // Expose game to player
    this.player.game = this;
    console.log(this.player);
  
};


Game.prototype.initMap = function() {
    
    // Create Floor object objects
    var F1 = new Floor(F1_data);    
    var F2 = new Floor(F2_data);
    var BF1 = new Floor(BF1_data)

    // Add floor data
    F1.addFloorData();
    F2.addFloorData();
    BF1.addFloorData();
    
    // Create game map
    this.map = new Map(map_data);
    
    // Add floors to map
    this.map.addFloor(F1);
    this.map.addFloor(F2);
    this.map.addFloor(BF1);

    // Add map data to map
    this.map.addMapData();
    
    // Add ladders data to map
    this.map.addLadders();
    
    // Create map layers
    this.map.createMapLayers();
    
    // Create gameboy
//    this.map.initGameboy();
//    this.map.drawGameboy();

};

Game.prototype.initGraph = function() {
 
    // Create game graph
    this.graph = new Graph();
    
    // Add map to graph
    this.map.addMapToGraph(this.graph);
    console.log(Object.keys(this.graph.adj).length);
    
};



/*******************************************/
/**********    Player Methods    ***********/
/*******************************************/


Game.prototype.updatePlayer = function() {
    
    var player = this.player;
    
    if (this.GAME_STATE === 'USER MOVE') {
        // Hide player;
        return;
    }
    
    if (player.MOVE_STATE === 'STILL' ||
        player.MOVE_STATE === 'WALL WALK') { 
        
        if (this.GAME_STATE === 'PATHFINDING') {
            this.spoofKeyPress();
        }
        
        if (this.KEYPRESS) {           
            this.startMove();
        }
        
    }
    
    if (player.MOVE_STATE === 'WALK' || 
            player.MOVE_STATE === 'SURF' || 
            player.MOVE_STATE === 'JUMP ON' ||
            player.MOVE_STATE === 'JUMP OFF' ||
            player.MOVE_STATE === 'TURN' ||
            player.MOVE_STATE === 'WALL WALK' ||
            player.MOVE_STATE === 'LADDER') {
        
        if (player.MOVE_STATE === 'LADDER') {
            console.log('climb  baby climb');
        }
        
        player.interpolateMove();
    } 
    
    player.updateSpriteOptions();
    
};

Game.prototype.drawPlayer = function() {
    this.player.drawPlayer();
};


Game.prototype.spoofKeyPress = function() {
    
    var pathfinder = this.pathfinder;
    var path = pathfinder.path;
    var index = pathfinder.index;

    if (path.length <= 0 || (index + 1) >= path.length) {
        this.GAME_STATE = 'NORMAL';
        this.KEYPRESS = null;
        return;
    }
    
    var KEYPRESS =  this.KEYPRESS;
    
    var startTile = path[index];
    var endTile = path[index + 1];
    
//    console.log(game.index);
//    if (game.index === 129) {
//        console.log('WAIT');
//    }
    console.info(startTile, endTile);
    
    startTile = this.getTileFromId(startTile);
    endTile = this.getTileFromId(endTile);
    
    if (endTile.ladder) {
        endTile = this.map.getTileOtherEndLadder(endTile);        
    }
    
    // Determine displacement from startTile to endTile
    var displacement = {
        row: 0,
        col: 0
    };
    
    displacement.row = endTile.row - startTile.row;
    displacement.col = endTile.col - startTile.col;
     
    // Use displacement to determine direction
    if (displacement.row === -1) {
        KEYPRESS = 'UP';
    }
    else if (displacement.row === +1) {
        KEYPRESS = 'DOWN';
    }
    else if (displacement.col === -1) {
        KEYPRESS = 'LEFT';
    }
    else if (displacement.col === +1) {
        KEYPRESS = 'RIGHT';
    }
    
    this.KEYPRESS = KEYPRESS;
    pathfinder.index += 1;
    
};


Game.prototype.startMove = function() {
    
    var KEYPRESS = this.KEYPRESS;
    var graph = this.graph;
    var player = this.player;
    
    var startTile = player.tile;
    var floor = startTile.floor;
    var row = startTile.row;
    var col = startTile.col;  
    
    // Determine direction of movement
    var displacement = {
        row: 0,
        col: 0
    };
    
    if (KEYPRESS === 'UP') {
        displacement.row = -1;  
    }
    else if (KEYPRESS === 'DOWN') {
        displacement.row = +1; 
    }
    else if (KEYPRESS === 'LEFT') {
        displacement.col = -1;
    }
    else if (KEYPRESS === 'RIGHT') {
        displacement.col = +1;
    }
    
    // ----- 0. Climbing ladder ----- //
    // You were sent here by the end of another move
    if (player.MOVE_STATE === 'LADDER') {
        
        player.startTile = startTile;
        player.endTile = this.map.getTileOtherEndLadder(startTile);
        
        //this.map.resetPath()
        
        
        var speed = player.getSpeed();
        player.time.total = 1/speed;
        player.time.start = new Date();
        player.interpolateMove();
        return;        
    }
    
    // ----- 1. Turning ----- //
    // If player is still, and user direction does not match player direction
    // and game not currently following path
    if (player.MOVE_STATE === 'STILL' && this.GAME_STATE === 'NORMAL') {
        
        console.info('about to turn');
        
        if (KEYPRESS !== player.playerOptions.FACING) {
            console.info('turn');
            player.MOVE_STATE = 'TURN';
            player.changeDirection(KEYPRESS);
            
            // Reset surf counter
            player.surfTicks = 0;
            
            player.startTile = startTile;
            player.endTile = startTile;
            
            var speed = player.getSpeed();
            player.time.total = 1/speed;
            player.time.start = new Date();
            player.interpolateMove();
            
            return;
        }
    }
    
    
    // ----- 2a. Walking into Walls ----- //
    // If user direction is same as current direction, continue walking into wall
    // Otherwise, interrupt and process user input
    if (player.MOVE_STATE === 'WALL WALK') {
        
        if (KEYPRESS === player.playerOptions.FACING) {
            player.interpolateMove();
            return;
        }
        
    }
    
    // Determine final tile
    var endTile = this.map.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If startTile is a ladder
    
    // If endTile is a ladder
//    if (endTile.ladder) {
//        // Redirect player, move to ladder instead
//        endTile = this.getOtherEndLadder(endTile);
//    }        
//    
    // If tile is reachable
    if (endTile && (graph.hasEdge(startTile.id, endTile.id) || endTile.ladder)) {
          
        // Movement is admissable, begin interpolation 
        player.changeDirection(KEYPRESS);
        player.startTile = startTile;
        player.endTile = endTile;
        
        
        player.start.row = row;
        player.start.col = col;
        
        player.displacement = displacement;
        
        // Set move state, determine time allotted for move
        var speed;
        // ----- 3. Jumping onto water pokemon ----- //
        if (startTile.type === 'LAND' && endTile.type === 'WATER') {
            player.MOVE_STATE = 'JUMP ON';    
        } 
        // ----- 4. Jumping off of water pokemon ----- //
        else if (startTile.type === 'WATER' && endTile.type === 'LAND') {      
            player.MOVE_STATE = 'JUMP OFF';
        }
        // ----- 5. Walking on land ----- //
        else if (startTile.type === 'LAND') {
            player.MOVE_STATE = 'WALK';
        }
        // ----- 6. Surfing on water ----- //
        else if (startTile.type === 'WATER') {         
            player.MOVE_STATE = 'SURF';
        }
        
        var speed = player.getSpeed();
        player.time.total = 1/speed;
        player.time.start = new Date();
        player.interpolateMove();
        
    }
    
    // ----- 2b. Walking into walls ----- //
    // Animate walking against wall
    else if (endTile && !graph.hasEdge(startTile.id, endTile.id)) {
        
        // Only animate walking into walls on land
        if(startTile.type === 'LAND') {
            
            player.MOVE_STATE = 'WALL WALK';
            player.changeDirection(KEYPRESS);
            
            player.changeDirection(KEYPRESS);
            player.startTile = startTile;
            player.endTile = startTile;
            
            var speed = player.getSpeed();
            player.time.total = 1/speed;
            player.time.start = new Date();
            player.interpolateMove();
        }
        
    }
    
};


Game.prototype.drawMap = function() {
    
    var map = this.map;
    
    if (map.LAYER_STATE === 'BITMAP') {
        map.drawBitmapLayers();
    } else if (map.LAYER_STATE === 'GRAPHIC') {
        map.drawGraphicLayers();
    }
    
    // Draw rows/cols
    if (map.ROWSCOLS_STATE === 'ON') {
        map.drawRowsCols();   
    };
    
    if (this.pathfinder.PATH_STATE === 'VISUALIZE' || 1) {
        map.drawVisualizationLayer();
    }
      
};

Game.prototype.drawTransition = function() {
    if (this.player.MOVE_STATE === 'LADDER') {
        this.map.drawMapTransitionLayer();
    }
};

Game.prototype.getLayerState = function() {
    return this.map.LAYER_STATE;  
};

Game.prototype.toggleRowsCols = function(state) {
    this.map.ROWSCOLS_STATE = state;
};

Game.prototype.toggleMapLayers = function(layer) {
    this.map.LAYER_STATE = layer;
};

Game.prototype.getTile = function(row, col) {
    return this.map.getTile(row, col);
};


Game.prototype.getTileSize = function() {
    return this.map.tile_size;    
};


Game.prototype.getPlayerTopLeft = function() {
        
    var player = this.player;
    return this.getTileTopLeft(player.tile);
    
};

Game.prototype.getPlayerMoveState = function() {
    return this.player.MOVE_STATE;
};

Game.prototype.setGameState = function(state) {
    this.GAME_STATE = state;    
};

Game.prototype.getGameState = function() {
    return this.GAME_STATE;
};

Game.prototype.setPlayerTile = function(tile) {
    this.player.setTile(tile);
};

Game.prototype.setPlayerSpeed = function(speed) {
    this.player.factorSpeed = speed;
};

Game.prototype.getPlayerGender = function() {
    return this.player.playerOptions.GENDER;    
};

Game.prototype.setPlayerGender = function(GENDER) {
    this.player.playerOptions.GENDER = GENDER;
};

Game.prototype.getTileFromPointer = function(top, left) {
    return this.map.getTileFromPointer(top, left);  
};


Game.prototype.getTileFromId = function(tileId) {
    return this.map.getTileFromId(tileId);
};


Game.prototype.drawHoverTile = function() {
    
    //console.log(this.validTile);
    
    if (!this.hoverTile) {
        return;
    }
    
    var tile = this.getTileFromId(this.hoverTile);
    var floor = tile.floor;
    
    var row = tile.row;
    var col = tile.col;
    var floor = tile.floor;
    
    var x = col * floor.tile_size;
    var y = row * floor.tile_size;
    
    floor.frame.ctx.strokeStyle = 'yellow';
    floor.frame.ctx.strokeRect(x + floor.frame.offset_x, y + floor.frame.offset_y, floor.tile_size, floor.tile_size);   
    
};


Game.prototype.setTransitionAlpha = function(alpha) {
    console.log(alpha);
    this.map.setMapTransitionLayerAlpha(alpha);
    
};

Game.prototype.getTileEuclidDistance = function(tile1, tile2) {
    return this.map.getTileEuclidDistance(tile1, tile2);
};


// Reset the pointer of the context on the path layer for this tile's floor
Game.prototype.resetPathPointer = function(tile) {
    
//    var ctx = tile.floor.graphic.path.getContext('2d');
//    ctx.beginPath();
    
};


Game.prototype.getTileTopLeft = function(tile) {
    return this.map.getTileTopLeft(tile);    
};


Game.prototype.startPathfinder = function(state) {
    this.pathfinder.startPathfinder(state);
};

Game.prototype.updatePathfinder = function() {
    
    var pathfinder = this.pathfinder;
    pathfinder.updatePathfinder();
    
    //console.log(pathfinder.PATH_STATE);
    
};