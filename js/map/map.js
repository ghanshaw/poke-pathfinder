var Map = function(map_data) {
    
    this.floors = {};
    this.sprite = null;
    this.map_data = map_data;
    
    //    //this.LAYER_STATE =  {
    //        BITMAP: 0,
    //        GRAPHIC: 1
    //    }
    //    
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
    
    if (sprite.MOVE_STATE === 'STILL') { 
        
        if (game.DIRECTION) {           
            this.startMove();
        }
        
    }
    
    else { sprite.interpolateMove(game); }
    
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
    
    
    
    // Determine final tile
    var endTile = this.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If tile is reachable
    if (endTile && graph.hasEdge(startTile.id, endTile.id)) {
        
        // If tile is ladder, get tile on other end of ladder
        if (endTile.ladder) {  
            endTile = this.useLadder(endTile);
        }
        
        // Movement is admissable, begin interpolation 
        sprite.changeDirection(DIRECTION);
        sprite.startTile = startTile;
        sprite.endTile = endTile;
        
        
        sprite.start.row = row;
        sprite.start.col = col;
        
        sprite.displacement = displacement;
        
        // Set move state, determine time allotted for move
        var speed;
        if (startTile.type === 'LAND' && endTile.type === 'WATER') {
            sprite.MOVE_STATE = 'JUMP ON';  
            speed = sprite.jumpSpeed;            
        } 
        else if (startTile.type === 'WATER' && endTile.type === 'LAND') {      
            sprite.MOVE_STATE = 'JUMP OFF';
            speed = sprite.jumpSpeed;
        }
        else if (startTile.type === 'LAND') {
            sprite.MOVE_STATE = 'WALK';
            speed = sprite.walkSpeed;
        }
        else if (startTile.type === 'WATER') {            
            sprite.MOVE_STATE = 'SURF';
            speed = sprite.surfSpeed;
        }
        
        sprite.time.total = 1/speed;
        sprite.time.start = new Date();
        sprite.interpolateMove();
        
    }
    
};


Map.prototype.useLadder = function(endA) {
    
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


Map.prototype.highlightTile = function(x, y, targetCanvas) {
    
    // Find corresponing floor
    for (let f in this.floors) {
        var floor = this.floors[f];
        if (targetCanvas === floor.canvas.id) {
            break;
        }
    }
    
    var canvas_col = Math.floor(x / floor.tile_size);
    var canvas_row = Math.floor(y / floor.tile_size);
    
    // Remove offset of row, col
    var floor_row = canvas_row - floor.offset_rows;
    var floor_col = canvas_col - floor.offset_cols;
    
    // Get tile type
    var tileType = floor.getTileType(floor_row, floor_col);
    
    if (tileType && tileType !== 'ROCK') {
        floor.highlightTile(floor_row, floor_col);
    }
    
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