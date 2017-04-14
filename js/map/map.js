var Map = function(map_data) {
    
    this.floors = {};
    this.player = null;
    this.map_data = map_data;
    
    //    //this.LAYER_STATE =  {
    //        BITMAP: 0,
    //        GRAPHIC: 1
    //    }
    //    
    this.transitionSpeed = 1.5;
};

Map.prototype.addFloor = function(floor) {
    if (!this.floors.hasOwnProperty(floor.id)) {
        this.floors[floor.id] = floor;
    }
    
};

Map.prototype.getTile = function(floor, row, col) {
    
    if (!this.floors.hasOwnProperty(floor.id)) {
        console.error('Missing floor');
        return null;
    }
    
    var floor = this.floors[floor.id];
    return floor.getTile(row, col);
    
};

Map.prototype.addLadders = function() {
    var map_ladders = {};
    
    for (let f in this.floors) {
        
        // Ladders on floor f
        let ladders = this.floors[f].floor_data.ladders();
        
        // Loop through ladders
        for (let l of ladders) {
            
            // Create array of tiles if neccessary
            if (!map_ladders.hasOwnProperty(l.id)) {
                map_ladders[l.id] = [];
            }
            
            // Get ladder's tile
            let row =  l.tile[0];
            let col =  l.tile[1];
            
            // Add tile to map's ladder object
            map_ladders[l.id].push([this.floors[f].id, row, col].toString()); 
        }
        
    }
    
    this.ladders = map_ladders;
    console.log(this.ladders);
    
};

Map.prototype.updateMap = function() {
    
    var map_data = this.map_data;
    
    // Extract key tile data
    this.keyTiles = map_data.keyTiles();
    
    // Turn tiles in tile objects
    for (let keyT of this.keyTiles) {
        var tileId = keyT.tile.toString();
        keyT.tile = this.getTileFromId(tileId);   
    }
    
};

Map.prototype.updateGraph = function(graph) {
    
    this.graph = graph;
    
    for (let f in this.floors) {
        this.floors[f].updateGraph(graph);
    }
    
    
    /*
     * If a tile is adjacent to a ladder, add an edge from a tile to 
     * the other end of the ladder. There is no edge between tiles and (physically) 
     * adjacent ladders. This is done to prevent tile from being used by BFS
     * 
     */
    
    // Add edges from ladder's neighbors to ladder's other end
    // Remove edges from ladder's neighbor to ladder
    // Preserve edges from ladder to ladder's neighbors
    // Thus creating directed path from endA's neighbors --> endB --> endB's neighbors --> endA --> endA's neighbors
    for (let l in this.ladders) {
        let ladder = this.ladders[l];
        let endA = ladder[0];
        let endB = ladder[1];
            
        let vAdj = graph.getAdj(endA);
        for (let v of vAdj) {
            graph.addEdge(v, endB); 
            graph.removeEdge(v, endA);
        }
        
        vAdj = graph.getAdj(endB);
        for (let v of vAdj) {
            graph.addEdge(v, endA); 
            graph.removeEdge(v, endB);
        }
    }
    
    console.log(graph);
    
};


Map.prototype.getTileFromId = function(tileId) {
    
    var tile_arr = tileId.split(',');
    var floorId = tile_arr[0];
    
    return this.floors[floorId].getTile(tile_arr[1], tile_arr[2]);
};



/*******************************************/
/**********    Sprite Methods    ***********/
/*******************************************/


Map.prototype.drawSprite = function() {
    //    var f = this.player.tile.floor;
    //    this.floors[f].drawSprite(this.player);
    
    this.player.drawSprite();
};


Map.prototype.spoofDirection = function(game) {
    
    
    if (game.PATH.length <= 0 || (game.index + 1) >= game.PATH.length) {
        game.GAME_STATE = 'NORMAL';
        game.DIRECTION = null;
        return;
    }
    
    var DIRECTION =  game.DIRECTION;
    
    var startTile = game.PATH[game.index];
    var endTile = game.PATH[game.index + 1];
    
    console.log(game.index);
    if (game.index === 129) {
        console.log('WAIT');
    }
    console.info(startTile, endTile);
    
    startTile = this.getTileFromId(startTile);
    endTile = this.getTileFromId(endTile);
    
    if (endTile.ladder) {
        endTile = this.getOtherEndLadder(endTile);        
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
        DIRECTION = 'UP';
    }
    else if (displacement.row === +1) {
        DIRECTION = 'DOWN';
    }
    else if (displacement.col === -1) {
        DIRECTION = 'LEFT';
    }
    else if (displacement.col === +1) {
        DIRECTION = 'RIGHT';
    }
    
    game.DIRECTION = DIRECTION;
    game.index += 1;
    
};

Map.prototype.updatePath = function(game) {
    
  if (1) {
      
        for (let f in this.floors) {
            this.floors[f].appendPath(this.player);
        }
        
  }  
    
};

// Reset the pointer of the context on the path layer for this tile's floor
Map.prototype.resetPathPointer = function(tile) {
    
    var ctx = tile.floor.graphic.path.getContext('2d');
    ctx.beginPath();
    
};

Map.prototype.movePathPointerToSprite = function(game) {
    
  if (1) {
      
        for (let f in this.floors) {
            this.floors[f].appendPath(this.player);
        }
        
  }  
    
};




Map.prototype.updateSprite = function(game) {
    
    var player = this.player;
    
    if (player.MOVE_STATE === 'USER MOVE') {
        // Hide player;
        return;
    }
    
    if (player.MOVE_STATE === 'STILL' ||
            player.MOVE_STATE === 'WALL WALK') { 
        
        if (game.GAME_STATE === 'PATHFINDING') {
            this.spoofDirection(game);
        }
        
        if (game.DIRECTION) {           
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
        
        player.interpolateMove(game);
    } 
    
    player.updateSpriteOptions();
    
};

Map.prototype.startMove = function() {
    
    var DIRECTION = this.game.DIRECTION;
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
    
    if (DIRECTION === 'UP') {
        displacement.row = -1;  
    }
    else if (DIRECTION === 'DOWN') {
        displacement.row = +1; 
    }
    else if (DIRECTION === 'LEFT') {
        displacement.col = -1;
    }
    else if (DIRECTION === 'RIGHT') {
        displacement.col = +1;
    }
    
    // ----- 0. Climbing ladder ----- //
    // You were sent here by the end of another move
    if (player.MOVE_STATE === 'LADDER') {
        
        player.startTile = startTile;
        player.endTile = this.getOtherEndLadder(startTile);
        
        //this.map.resetPath()
        
        speed = this.transitionSpeed;
        player.time.total = 1/speed;
        player.time.start = new Date();
        player.interpolateMove();
        return;        
    }
    
    // ----- 1. Turning ----- //
    // If player is still, and user direction does not match player direction
    // and game not currently following path
    if (player.MOVE_STATE === 'STILL' && this.game.GAME_STATE !== 'PATHFINDING') {
        
        console.info('about to turn');
        
        if (DIRECTION !== player.playerOptions.FACING) {
            console.info('turn');
            player.MOVE_STATE = 'TURN';
            player.changeDirection(DIRECTION);
            
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
        
        if (DIRECTION === player.playerOptions.FACING) {
            player.interpolateMove();
            return;
        }
        
    }
    
    // Determine final tile
    var endTile = this.getTile(floor, row + displacement.row, col + displacement.col);
    
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
        player.changeDirection(DIRECTION);
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
            player.changeDirection(DIRECTION);
            
            player.changeDirection(DIRECTION);
            player.startTile = startTile;
            player.endTile = startTile;
            
            var speed = player.getSpeed();
            player.time.total = 1/speed;
            player.time.start = new Date();
            player.interpolateMove();
        }
        
    }
    
};




Map.prototype.getOtherEndLadder = function(endA) {
    
    // Get the ladder associate with this tile
    var ladderId = endA.ladderId;
    var ladder = this.ladders[ladderId];
    
    // Select tile on other end of ladder
    var endB = ladder[0] === endA.id ? ladder[1] : ladder[0];
    var endB = endB.toString();
    var endB = this.getTileFromId(endB);
    
    return endB;
    
};


/*******************************************/
/*******    Layer Drawing Methods    *******/
/*******************************************/

// Create black rectangle used for transitions
Map.prototype.createMapTransitionLayer = function() {
  
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';

    this.transitionLayer = canvas;
    
};


Map.prototype.drawMapTransitionLayer = function() {
    
    if (this.player.MOVE_STATE === 'LADDER') {
        
        var transitionLayer = this.transitionLayer;
        var transitionCtx = transitionLayer.getContext('2d');
        transitionCtx.globalAlpha =  transitionLayer.globalAlpha;
        transitionCtx.clearRect(0, 0, transitionLayer.width, transitionLayer.height);
        transitionCtx.fillStyle = 'black';
        transitionCtx.fillRect(0, 0, transitionLayer.width, transitionLayer.height);
        
        for (let f in this.floors) {           
            var canvas = this.floors[f].canvas;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(transitionLayer, 0, 0, canvas.width, canvas.height);      
        }
    }
       
};


Map.prototype.createMapLayers = function(graph) { 
    
    for (let f in this.floors) {
        this.floors[f].initCanvas();
        this.floors[f].createBitmapRockLayer();
        this.floors[f].createBitmapFloorLayer();
        
        
        this.floors[f].createGraphicRockLayer();
        this.floors[f].createGraphicFloorLayer();
        this.floors[f].createGraphicKeyTiles();
        this.floors[f].createGraphicRowsCols();
        this.floors[f].createGraphicEdges(graph);
        
        
        this.floors[f].createGraphicPathLayer();
        
        
        
        //        this.floors[f].drawBitmapRockLayer();
        //        this.floors[f].drawBitmapFloorLayer();
        ////        this.floors[f].drawGraphicRockLayer();
        ////        this.floors[f].drawGraphicFloorLayer();
        //        this.floors[f].drawGraphicRowsCols();
        //        this.floors[f].drawGraphicKeyTiles();
        ////        this.floors[f].drawGraphicEdges();
        
    } 
    
    this.createMapTransitionLayer();
    
    // Define tile_size
    
    //this.createKeyTiles();
    
};



Map.prototype.drawGraphicLayers = function() {
    
    for (let f in this.floors) {   
        this.floors[f].drawGraphicRockLayer();
        this.floors[f].drawGraphicFloorLayer(); 
    }
};




Map.prototype.drawBitmapLayers = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawBitmapRockLayer();
        this.floors[f].drawBitmapFloorLayer();
    }
};


Map.prototype.drawGraphicRowsCols = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawGraphicRowsCols();
    }
    
};

Map.prototype.drawGraphicPath = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawGraphicPath();
    }
    
};










Map.prototype.initDivs = function() {
  
    var player = this.player;
    var tile_size = player.tile.floor.tile_size;
    var game = this.game;
  
    var playerDiv = document.createElement('div');
    
    $('.canvasWrapper').append(playerDiv);
    
    $(playerDiv).attr('id', 'playerDiv');
    $(playerDiv).css({'width': tile_size, 'height': tile_size });
    
    var tinyPlayerBoy = document.getElementById('tiny-player-boy');
    var tinyPlayerGirl = document.getElementById('tiny-player-girl');
    
    $(tinyPlayerBoy).css({'width': tile_size * 2, 'height': tile_size * 2});
    $(tinyPlayerGirl).css({'width': tile_size * 2, 'height': tile_size * 2});
    
    //var GENDER = game.GENDER;
    var GENDER = 'BOY';
    
    this.playerDiv = playerDiv;
    this.updateDivs();
    
    $(playerDiv).draggable({
        addClasses: true,
//        revert: function() {
//            
//            return true;
//        },
        cursor: "crosshair",
        cursorAt: { top: 5, left: 5 },
        appendTo: 'body',
        //containment: ".mapWrapper",
//        helper: function( event ) {
//            
//            console.log('help me');
//            
//            if (GENDER === 'BOY') {
//                return $( tinyPlayerBoy );
//            }
//            else if (game.GENDER === 'GIRL') {
//                return $( tinyPlayerGirl );
//            }
//
//        }
    });
    
   
    
};


Map.prototype.getSpriteTopLeft = function() {
        
    var player = this.player;
    var floor = this.player.tile.floor;
    var tile_size = player.tile.floor.tile_size;
    
    var top = (player.current.row + floor.offset_rows) * tile_size;
    var left = (player.current.col + floor.offset_cols) * tile_size;

    // Include distance of canvas from top of canvasWrapper
    var position = $(floor.canvas).position();
    top += position.top;
    left += position.left;
    
    
    return {
        top: top,
        left: left
    };
    
};


Map.prototype.updateDivs = function() {
        
    var player = this.player;
    var playerDiv = this.playerDiv;
    var floor = this.player.tile.floor;
    var tile_size = player.tile.floor.tile_size;
    
    var top = (player.current.row + floor.offset_rows) * tile_size;
    var left = (player.current.col + floor.offset_cols) * tile_size;

    // Include distance of canvas from top of canvasWrapper
    var offset_top = $(floor.canvas).position().top;
    top += offset_top;
    
    $(playerDiv).css({'top': top, 'left': left});
    
    //console.log(player);
    
    
    
};


Map.prototype.startUserMove = function(x, y, targetId) {
    
    var player = this.player;
    
    if (targetId === this.playerDiv.id) {
        
       // If player isn't currently moving, initiate player move
        if (player.MOVE_STATE === 'STILL') {     
            player.MOVE_STATE = 'USER MOVE';          
        }
        
    }
    
    /*** Reserved in case div is removed ***/
    
//    var pointerTile = this.getTileFromPointer(x, y, targetId);
//    var playerTile = this.player.tile;
//    
//    // If user is clicking on player
//    if (pointerTile && pointerTile.id === playerTile.id) {
//        
//        // If player isn't currently moveing, initiate player move
//        if (player.MOVE_STATE === 'STILL') {     
//            player.MOVE_STATE = 'USER MOVE';          
//        }
//       
//    }
    
    
};

Map.prototype.endUserMove = function() {
    
    var player = this.player;
    
    if (this.validTile) {
        var tile = this.getTileFromId(this.validTile);
        player.setTile(tile);
        console.log('set to null');
        this.validTile = null;
    }
    
    player.MOVE_STATE = 'STILL';

};

Map.prototype.getTileFromPointer  = function(top, left) {
    
    // Find corresponing floor
    for (let f in this.floors) {
        var floor = this.floors[f];
        
        var floor_position = $(floor.canvas).position();
        var floor_height = floor.canvas.height;
        
        if (top > floor_position.top && top < (floor_position.top + floor_height)) {
            
            // Adjust top, so it's within floor
            top -= floor_position.top;
            left -= floor_position.left;
            break;
            console.log('correct floor');
            console.log(floor.id);
        }
       
    }
    
  
    var cave_col = Math.floor(left / floor.tile_size);
    var cave_row = Math.floor(top / floor.tile_size);
    
    // Remove offset of row, col
    var floor_row = cave_row - floor.offset_rows;
    var floor_col = cave_col - floor.offset_cols;
    
    // Get tile type
    var tile = floor.getTile(floor_row, floor_col);
    
    return tile;
    
};

Map.prototype.highlightTile = function(x, y, targetId) {
   
   if (targetId === this.playerDiv.id) {
       console.log('playerDiv.id');
      this.validTile = null;
      return;
   }
    
    var pointerTile = this.getTileFromPointer(x, y, targetId);
    
    if (pointerTile && pointerTile.type !== 'ROCK') {
        this.validTile = pointerTile.id;
    } else {
        console.log('no tile');
        this.validTile = null;
    }
    
};

Map.prototype.drawHighlights = function() {
    
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
    
    floor.ctx.strokeStyle = 'yellow';
    
    floor.ctx.strokeRect(x + floor.offset_x, y + floor.offset_y, floor.tile_size, floor.tile_size);   
    
};



Map.prototype.updateVisualization = function() {
    
  
  
    
    
};





Map.prototype.initGameboy = function() {
    
    this.gameboy = {};
    
    var canvas = document.getElementById('gameboy');
    var ctx = canvas.getContext('2d');
    
    var tile_size = canvas.width / 15;
    
    canvas.height = tile_size * 10;
    
    this.gameboy.canvas = canvas;
    this.gameboy.ctx = ctx;
    
};

Map.prototype.drawGameboy = function() {
    
    
    var player = this.player;
    var floor = this.player.tile.floor;
    var floorlayer = floor.bitmap.floorlayer;
    
    var canvas = this.gameboy.canvas;
    var ctx = this.gameboy.ctx;
    
    var sx = (player.current.col - 7) * floor.tile_size;
    var sy = (player.current.row - 4.5) * floor.tile_size;
    
    ctx.drawImage(floor.canvas, sx, sy, floor.tile_size * 15, floor.tile_size * 10, 0, 0, canvas.width, canvas.height);
    //ctx.drawSprite()
};