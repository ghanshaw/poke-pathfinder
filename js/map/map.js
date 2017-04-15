var Map = function(map_data) {
    
    // Create object to hold floors
    this.floors = {};
    
    // Define initial state
    this.LAYER_STATE = 'BITMAP';
    this.ROWSCOLS_STATE = 'OFF';
    
};


Map.prototype.addMapData = function() {
    
    // Extract key tile data
    this.keyTiles = map_data.keyTiles();
    
    // Turn tiles in tile objects
    for (let keyT of this.keyTiles) {
        var tileId = keyT.tile.toString();
        keyT.tile = this.getTileFromId(tileId);   
    }
    
    this.map_data = map_data;
    
};

Map.prototype.addMapToGraph = function(graph) {
    
    for (let f in this.floors) {
        this.floors[f].addFloorToGraph(graph);
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


Map.prototype.addFloor = function(floor) {
    if (!this.floors.hasOwnProperty(floor.id)) {
        this.floors[floor.id] = floor;
    }
    
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


/*****************************************/
/**********    Tile Methods    ***********/
/*****************************************/


Map.prototype.getTile = function(floor, row, col) {
    
    if (!this.floors.hasOwnProperty(floor.id)) {
        console.error('Missing floor');
        return null;
    }
    
    var floor = this.floors[floor.id];
    return floor.getTile(row, col);
    
};

Map.prototype.getTileFromId = function(tileId) {
    
    var tile_arr = tileId.split(',');
    var floorId = tile_arr[0];
    
    return this.floors[floorId].getTile(tile_arr[1], tile_arr[2]);
};


Map.prototype.getTileTopLeft = function(tile) {
    
    var frame = tile.floor.frame;
    var tile_size = tile.floor.tile_size;
    
    var top = (tile.row + frame.offset_rows) * tile_size;
    var left = (tile.col + frame.offset_cols) * tile_size;

    // Include distance of frame canvas from top of canvasWrapper
    var position = $(frame.canvas).position();
    top += position.top;
    left += position.left;
    
    return {
        top: top,
        left: left
    }; 
    
};


Map.prototype.getTileFromPointer  = function(top, left) {
    
    // Find corresponing floor
    for (let f in this.floors) {
        var floor = this.floors[f];
        var frame = floor.frame;
        
        var frame_position = $(frame.canvas).position();
        var frame_height = frame.canvas.height;
        
        if (top > frame_position.top && top < (frame_position.top + frame_height)) {
            
            // Adjust top, so it's within floor
            top -= frame_position.top;
            left -= frame_position.left;
            break;
            console.log('correct floor');
            console.log(frame.canvas.id);
        }
       
    }
    
    var frame_col = Math.floor(left / floor.tile_size);
    var frame_row = Math.floor(top / floor.tile_size);
    
    // Remove offset of row, col
    var floor_row = frame_row - frame.offset_rows;
    var floor_col = frame_col - frame.offset_cols;
    
    // Get tile type
    var tile = floor.getTile(floor_row, floor_col);
    
    return tile;
    
};


Map.prototype.getTileEuclidDistance = function(tile1, tile2) {
    
//    var tile1 = this.getTileFromId(tile1_id);
//    var tile2 = this.getTileFromId(tile2_id);

    // Get top/left, or x/y of tile (they're the same thing)
    var tile1_xy = this.getTileTopLeft(tile1);
    var tile2_xy = this.getTileTopLeft(tile2);
    
    var delta_y = tile1_xy.top - tile2_xy.top;
    var delta_x = tile1_xy.left - tile2_xy.left;
    
    var x2 = Math.pow(delta_x, 2);
    var y2 = Math.pow(delta_y, 2);
    
    var distance = Math.pow(x2 + y2, .5);
    
    var max_width = this.getHeight();
    var max_height = this.getWidth();
    
    var max_height2 = Math.pow(max_height, 2);
    var max_width2 = Math.pow(max_width, 2);
    var max_distance = Math.pow(max_width2 + max_height2, .5);
    
    return distance/max_distance;
    
};

Map.prototype.getHeight = function() {
  
  return $('.caveWrapper').height();
    
};

Map.prototype.getWidth = function() {
  
  return $('.caveWrapper').width();
    
};


Map.prototype.getTileOtherEndLadder = function(endA) {
    
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
    
    // Compute dimentions of entire canvas
    var mapWrapperWidth = $('.caveWrapperBackground').width();
    
   
    // Define dimentions of game
    this.width = mapWrapperWidth;
    this.cols = 44;
    
    // Compute tile size (based on canvas size, or fixed)
    this.tile_size = Math.floor(this.width / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    this.tile_size = 16;
    
    for (let f in this.floors) {
        
        this.floors[f].createFrame(this.tile_size);
        this.floors[f].createBitmapRockLayer();
        this.floors[f].createBitmapFloorLayer();
        
        
        this.floors[f].createGraphicRockLayer();
        this.floors[f].createGraphicFloorLayer();
        
        this.floors[f].createRowsCols();
        //this.floors[f].createKeyTiles();
        //this.floors[f].createEdges();
        
        
        //this.floors[f].createPathLayer();
        
        
//        
//        this.floors[f].drawBitmapRockLayer();
//        this.floors[f].drawBitmapFloorLayer();
//        //        this.floors[f].drawGraphicRockLayer();
//        //        this.floors[f].drawGraphicFloorLayer();
//        this.floors[f].drawGraphicRowsCols();
//        this.floors[f].drawGraphicKeyTiles();
//        //        this.floors[f].drawGraphicEdges();
//        
    } 
    
    this.createMapTransitionLayer();
    
};


// Create black rectangle used for transitions
Map.prototype.createMapTransitionLayer = function() {
  
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);   
    ctx.fillStyle = 'black';

    this.transitionlayer = {
        canvas: canvas,
        ctx: ctx
    };
    
};

Map.prototype.setMapTransitionLayerAlpha = function(alpha) {
    this.transitionlayer.ctx.globalAlpha = alpha;
};


Map.prototype.drawMapTransitionLayer = function() {
    
    // Get transition layer
    var transitionlayer = this.transitionlayer;
    
    // Update layer with new shade black (based on current alpha set during interpolation);
    transitionlayer.ctx.clearRect(0, 0, transitionlayer.canvas.width, transitionlayer.canvas.height);
    transitionlayer.ctx.fillStyle = 'black';
    transitionlayer.ctx.fillRect(0, 0, transitionlayer.canvas.width, transitionlayer.canvas.height);
    
    for (let f in this.floors) {    
        console.log('transitioning');
        let frame = this.floors[f].frame; 
        frame.ctx.drawImage(transitionlayer.canvas, 0, 0, frame.canvas.width, frame.canvas.height);
    }
    
    
    
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


Map.prototype.drawRowsCols = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawRowsCols();
    }
    
};

Map.prototype.drawPath = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawPath();
    }
    
};

Map.prototype.drawVisualizationLayer = function() {
    
    for (let f in this.floors) {   
        this.floors[f].drawVisualizationLayer();
    }
    
};







































/*******************************************/
/**********    Player Methods    ***********/
/*******************************************/


































Map.prototype.updatePath = function(game) {
    
  if (1) {
      
        for (let f in this.floors) {
            this.floors[f].appendPath(this.player);
        }
        
  }  
    
};


Map.prototype.movePathPointerToSprite = function(game) {
    
  if (1) {
      
        for (let f in this.floors) {
            this.floors[f].appendPath(this.player);
        }
        
  }  
    
};


Map.prototype.updateVisualization = function() {
    
  
  
    
    
};





Map.prototype.initGameboy = function() {
    
    this.gameboy = {};
    
    var canvas = document.getElementById('gameboy');
    var ctx = canvas.getContext('2d');
    
    var tile_size = canvas.width / 15;
    
    canvas.height = tile_size * 10;
    
    this.gameboy= {
        canvas: canvas,
        ctx: ctx
    };
    
};

Map.prototype.drawGameboy = function(player) {
    
    var floor = player.tile.floor;
    //var frame = floor.frame;
    
    var sx = (player.current.col - 7) * floor.tile_size;
    var sy = (player.current.row - 4.5) * floor.tile_size;
    
    this.gameboy.ctx.drawImage(floor.frame.canvas, sx, sy, floor.tile_size * 15, floor.tile_size * 10, 0, 0, this.gameboy.canvas.width, this.gameboy.canvas.height);
    //ctx.drawSprite()
};