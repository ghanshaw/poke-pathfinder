var Map = function(map_data) {
    
    this.floors = {};
    this.sprite = null;
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

Map.prototype.updateLadders = function() {
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
    
    // Link ladders
    for (let l in this.ladders) {
        let ladder = this.ladders[l];
        graph.addEdge(ladder[0], ladder[1]);   
        graph.addEdge(ladder[1], ladder[0]);
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


Map.prototype.initSprite = function() {
    
    var sprite = new Sprite();
    sprite.initGraphic();
    sprite.initBitmap();
    
    //sprite.BitmapSprite(sprite_sheet);
    
    var entrance = this.keyTiles[0].tile;
    sprite.setTile(entrance);
    
    this.sprite = sprite;
    this.sprite.map = this;
    
};


Map.prototype.drawSprite = function() {
    //    var f = this.sprite.tile.floor;
    //    this.floors[f].drawSprite(this.sprite);
    
    this.sprite.drawSprite();
};


Map.prototype.updateSprite = function(game) {
    
    var sprite = this.sprite;
    
    
    if (sprite.MOVE_STATE === 'USER MOVE') {
        // Hide sprite;
        return;
    }
    
    if (sprite.MOVE_STATE === 'STILL' ||
            sprite.MOVE_STATE === 'WALL WALK') { 
        
        if (game.DIRECTION) {           
            this.startMove();
        }
        
    }
    
    if (sprite.MOVE_STATE === 'WALK' || 
            sprite.MOVE_STATE === 'SURF' || 
            sprite.MOVE_STATE === 'JUMP ON' ||
            sprite.MOVE_STATE === 'JUMP OFF' ||
            sprite.MOVE_STATE === 'TURN' ||
            sprite.MOVE_STATE === 'WALL WALK' ||
            sprite.MOVE_STATE === 'LADDER') {
        
        if (sprite.MOVE_STATE === 'LADDER') {
            console.log('climb  baby climb');
        }
        
        sprite.interpolateMove(game);
    } 
    
    sprite.updateSpriteOptions();
    
};

Map.prototype.startMove = function() {
    
    var DIRECTION = this.game.DIRECTION;
    var graph = this.graph;
    var sprite = this.sprite;
    
    var startTile = sprite.tile;
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
    if (sprite.MOVE_STATE === 'LADDER') {
        
        sprite.startTile = startTile;
        sprite.endTile = this.getOtherEndLadder(startTile);
        
        speed = this.transitionSpeed;
        sprite.time.total = 1/speed;
        sprite.time.start = new Date();
        sprite.interpolateMove();
        return;        
    }
    
    // ----- 1. Turning ----- //
    // If player is still, and user direction does not match player direction
    if (sprite.MOVE_STATE === 'STILL') {
        
        if (DIRECTION !== sprite.playerOptions.FACING) {
            sprite.MOVE_STATE = 'TURN';
            sprite.changeDirection(DIRECTION);
            
            // Reset surf counter
            sprite.surfTicks = 0;
            
            sprite.startTile = startTile;
            sprite.endTile = startTile;
            
            var speed = sprite.getSpeed();
            sprite.time.total = 1/speed;
            sprite.time.start = new Date();
            sprite.interpolateMove();
            
            return;
        }
    }
    
    
    // ----- 2a. Walking into Walls ----- //
    // If user direction is same as current direction, continue walking into wall
    // Otherwise, interrupt and process user input
    if (sprite.MOVE_STATE === 'WALL WALK') {
        
        if (DIRECTION === sprite.playerOptions.FACING) {
            sprite.interpolateMove();
            return;
        }
        
    }
    
    // Determine final tile
    var endTile = this.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If tile is reachable
    if (endTile && graph.hasEdge(startTile.id, endTile.id)) {
        
        // Movement is admissable, begin interpolation 
        sprite.changeDirection(DIRECTION);
        sprite.startTile = startTile;
        sprite.endTile = endTile;
        
        
        sprite.start.row = row;
        sprite.start.col = col;
        
        sprite.displacement = displacement;
        
        // Set move state, determine time allotted for move
        var speed;
        // ----- 3. Jumping onto water pokemon ----- //
        if (startTile.type === 'LAND' && endTile.type === 'WATER') {
            sprite.MOVE_STATE = 'JUMP ON';    
        } 
        // ----- 4. Jumping off of water pokemon ----- //
        else if (startTile.type === 'WATER' && endTile.type === 'LAND') {      
            sprite.MOVE_STATE = 'JUMP OFF';
        }
        // ----- 5. Walking on land ----- //
        else if (startTile.type === 'LAND') {
            sprite.MOVE_STATE = 'WALK';
        }
        // ----- 6. Surfing on water ----- //
        else if (startTile.type === 'WATER') {         
            sprite.MOVE_STATE = 'SURF';
        }
        
        var speed = sprite.getSpeed();
        sprite.time.total = 1/speed;
        sprite.time.start = new Date();
        sprite.interpolateMove();
        
    }
    
    // ----- 2b. Walking into walls ----- //
    // Animate walking against wall
    else if (endTile && !graph.hasEdge(startTile.id, endTile.id)) {
        
        // Only animate walking into walls on land
        if(startTile.type === 'LAND') {
            
            sprite.MOVE_STATE = 'WALL WALK';
            sprite.changeDirection(DIRECTION);
            
            sprite.changeDirection(DIRECTION);
            sprite.startTile = startTile;
            sprite.endTile = startTile;
            
            var speed = sprite.getSpeed();
            sprite.time.total = 1/speed;
            sprite.time.start = new Date();
            sprite.interpolateMove();
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
    
    if (this.sprite.MOVE_STATE === 'LADDER') {
        
        var transitionLayer = this.transitionLayer;
        transitionCtx = transitionLayer.getContext('2d');
        transitionCtx.globalAlpha =  transitionLayer.globalAlpha;
        transitionCtx.clearRect(0, 0, transitionLayer.width, transitionLayer.height);
        transitionCtx.fillStyle = 'black';
        transitionCtx.fillRect(0,0,transitionLayer.width, transitionLayer.height);
        
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
        
        
        
        //        this.floors[f].drawBitmapRockLayer();
        //        this.floors[f].drawBitmapFloorLayer();
        ////        this.floors[f].drawGraphicRockLayer();
        ////        this.floors[f].drawGraphicFloorLayer();
        //        this.floors[f].drawGraphicRowsCols();
        //        this.floors[f].drawGraphicKeyTiles();
        ////        this.floors[f].drawGraphicEdges();
        
    } 
    
    this.createMapTransitionLayer();
    
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










Map.prototype.initDivs = function() {
  
    var sprite = this.sprite;
    var tile_size = sprite.tile.floor.tile_size;
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
        
    var sprite = this.sprite;
    var floor = this.sprite.tile.floor;
    var tile_size = sprite.tile.floor.tile_size;
    
    var top = (sprite.current.row + floor.offset_rows) * tile_size;
    var left = (sprite.current.col + floor.offset_cols) * tile_size;

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
        
    var sprite = this.sprite;
    var playerDiv = this.playerDiv;
    var floor = this.sprite.tile.floor;
    var tile_size = sprite.tile.floor.tile_size;
    
    var top = (sprite.current.row + floor.offset_rows) * tile_size;
    var left = (sprite.current.col + floor.offset_cols) * tile_size;

    // Include distance of canvas from top of canvasWrapper
    var offset_top = $(floor.canvas).position().top;
    top += offset_top;
    
    $(playerDiv).css({'top': top, 'left': left});
    
    //console.log(sprite);
    
    
    
};


Map.prototype.startUserMove = function(x, y, targetId) {
    
    var sprite = this.sprite;
    
    if (targetId === this.playerDiv.id) {
        
       // If sprite isn't currently moveing, initiate sprite move
        if (sprite.MOVE_STATE === 'STILL') {     
            sprite.MOVE_STATE = 'USER MOVE';          
        }
        
    }
    
    /*** Reserved in case div is removed ***/
    
//    var pointerTile = this.getTileFromPointer(x, y, targetId);
//    var spriteTile = this.sprite.tile;
//    
//    // If user is clicking on sprite
//    if (pointerTile && pointerTile.id === spriteTile.id) {
//        
//        // If sprite isn't currently moveing, initiate sprite move
//        if (sprite.MOVE_STATE === 'STILL') {     
//            sprite.MOVE_STATE = 'USER MOVE';          
//        }
//       
//    }
    
    
};

Map.prototype.endUserMove = function() {
    
    var sprite = this.sprite;
    
    if (this.validTile) {
        var tile = this.getTileFromId(this.validTile);
        sprite.setTile(tile);
        console.log('set to null');
        this.validTile = null;
    }
    
    sprite.MOVE_STATE = 'STILL';

};

Map.prototype.getTileFromPointer  = function(top, left) {
    
    // Find corresponing floor
    for (let f in this.floors) {
        var floor = this.floors[f];
        
        floor_position = $(floor.canvas).position();
        floor_height = floor.canvas.height;
        
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
    
    
    var sprite = this.sprite;
    var floor = this.sprite.tile.floor;
    var floorlayer = floor.bitmap.floorlayer;
    
    var canvas = this.gameboy.canvas;
    var ctx = this.gameboy.ctx;
    
    var sx = (sprite.current.col - 7) * floor.tile_size;
    var sy = (sprite.current.row - 4.5) * floor.tile_size;
    
    ctx.drawImage(floor.canvas, sx, sy, floor.tile_size * 15, floor.tile_size * 10, 0, 0, canvas.width, canvas.height);
    //ctx.drawSprite()
};