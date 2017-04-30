var Map = function(game, map_data) {
    
    this.game = game;
    
    // Create object to hold floors
    this.floors = {};
    
    // Define initial state
    this.STATE = 'BITMAP';

    this.relativeOrder = [ 'F2', 'F1', 'BF1' ];

    this.layers = {
        GRID: false,
        PATH: false,
        FRONTIER: false,
        TRANSITION: false
    };
    
    this.map_data = map_data;
    
    this.rocklayer = {};
    
    this.waterlayer = [];
    
    this.transition = {};
    
};

Map.prototype.init = function(floors, graph) {
    
    
    // Add floors to map
    for (let f of floors) {  
        this.addFloor(f);
    }
    
    // Add map data to map
    this.addMapData();
    
    // Add map data to graph
    this.addMapToGraph(graph);
    
    // Add ladders data to map
    //this.map.addLadders();
    
    // Create map layers
    this.initMapLayers();
    
};

Map.prototype.initMapLayers = function(graph) {
    
    //var imgId;
    var img;
    
    // Get floor map png from html img
    var rocklayer = this.map_data.rocklayer();
    img = document.getElementById(rocklayer.id);
    
    this.rocklayer = {
        img: img,
        rows: rocklayer.rows,
        cols: rocklayer.cols
    };
    
    var waterlayer = this.map_data.waterlayer();
    var imgArr = [];
    for (let id of waterlayer.id) {
        img = document.getElementById(id);
        imgArr.push(img);
    };
    
    this.waterlayer = {
        img: imgArr,
        rows: waterlayer.rows,
        cols: waterlayer.cols
    };
    
    // Get floor map png from html img
    var transition = this.map_data.transition();
    img = document.getElementById(transition.id);
    this.transition = {
        img: img
    };
    
    console.log(this);
    
};


Map.prototype.addMapData = function() {
    
    // Extract key tile data
    this.keyTiles = map_data.keyTiles();
    
    // Turn tiles in tile objects
    for (let keyT of this.keyTiles) {
        var tileId = keyT.tile.toString();
        keyT.tile = this.getTileFromId(tileId);   
    }
    
    // Extract ladders
    this.ladders = map_data.ladders();
    
    // Turn ladders in tile objects
    for (let ladder of this.ladders) {
        var tileA = ladder.tile[0].toString();
        var tileB = ladder.tile[1].toString();
        
        tileA = this.getTileFromId(tileA);  
        tileB = this.getTileFromId(tileB); 
        
        // Turn tile into ladder
        tileA.ladder = true;
        tileB.ladder = true;
        
        tileA.ladderId = ladder.id;
        tileB.ladderId = ladder.id;

        
        ladder.tile[0] = tileA;
        ladder.tile[1] = tileB;
    };
    
    // Extract gap tile data
    this.gaps = map_data.gaps();
    
    // Turn tiles in tile objects
    for (let gap of this.gaps) {
        var tileId = gap.tile.toString();
        gap.tile = this.getTileFromId(tileId);   
        
        // Turn tile into gap
        gap.tile.gap = true;
        gap.tile.gapId = gap.id;
    }
    
    // Extract obstacle data
    this.obstacles = map_data.obstacles();
    
    // Turn tiles in tile objects
    for (let ob of this.obstacles) {
        var tileId = ob.tile.toString();
        ob.tile = this.getTileFromId(tileId);   
        
        // Turn tile into gap
        ob.tile.obstacle = ob.type;
        ob.tile.obstacleId = ob.id;
        
    }
    
    
    
    
    this.map_data = map_data;
    
};

Map.prototype.addMapToGraph = function(graph) {
    
    for (let f in this.floors) {
        this.floors[f].addFloorToGraph(graph);
    }
    
    
    // Remove edges to obstacles
    for (let ob of this.obstacles) {
        if (ob.LABEL === 'MEWTWO') {
            this.game.removeEdgesToNeighbors(ob.tile);   
        }
    }
    
    // Add edges between ladders 
    for (let l in this.ladders) {
        let ladder = this.ladders[l];
        let endA = ladder.tile[0];
        let endB = ladder.tile[1];
        
        graph.addEdge(endA.id, endB.id); 
        graph.addEdge(endB.id, endA.id);
    }
    
    console.log(graph);
    
    /*
     * If a tile is adjacent to a ladder, add an edge from a tile to 
     * the other end of the ladder. There is no edge between tiles and (physically) 
     * adjacent ladders. This is done to prevent tile from being used by BFS
     * 
     */
    
    // Add edges from ladder's neighbors to ladder's other end
    // Remove edges from ladder's neighbor to ladder
    // Preserve edges from ladder to ladder's neighbors
//    // Thus creating directed path from endA's neighbors --> endB --> endB's neighbors --> endA --> endA's neighbors
//    for (let l in this.ladders) {
//        let ladder = this.ladders[l];
//        let endA = ladder[0];
//        let endB = ladder[1];
//            
//        let vAdj = graph.getAdj(endA);
//        for (let v of vAdj) {
//            graph.addEdge(v, endB); 
//            graph.removeEdge(v, endA);
//        }
//        
//        vAdj = graph.getAdj(endB);
//        for (let v of vAdj) {
//            graph.addEdge(v, endA); 
//            graph.removeEdge(v, endB);
//        }
//    }
    
    console.log(graph);
    
};


Map.prototype.addFloor = function(floor) {
    if (!this.floors.hasOwnProperty(floor.id)) {
        
        // Add floor to map
        this.floors[floor.id] = floor;
        
        // Expose game to floor
        //floor.game = this.game;
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
    
    // Return if tileId is invalid (null or undefined)
    if (!tileId) { return; }
    
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


Map.prototype.getTileFromPointer  = function(pointer) {
    
    if (!pointer) {
        return;
    }
    
    var top = pointer.y;
    var left = pointer.x;
    var relativeTo = pointer.target;
    
    if (relativeTo !== 'caveWrapperBackground') {
        //var target_offset = $(target).offset();
        var wrapperOffset = $('.caveWrapperBackground').offset();
        
        top -= wrapperOffset.top;
        left -= wrapperOffset.left;
    }

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





Map.prototype.getMapEuclidDistance = function(tile1, tile2) {

    if (typeof tile1 === 'string') {
        tile1 = this.getTileFromId(tile1);
    }

    if (typeof tile2 === 'string') {
        tile2 = this.getTileFromId(tile2);
    }

    var map1 = this.getMapRowCol(tile1);
    var map2 = this.getMapRowCol(tile2);

    var deltaX = map1.col - map2.col;
        deltaX = Math.pow(deltaX, 2);

    var deltaY = map1.row - map2.row;
        deltaY = Math.pow(deltaY, 2);

    var distance = deltaX + deltaY;
        distance = Math.pow(distance, 0.5);

    return distance;

};


Map.prototype.getMapRowCol = function(tile) {

    
    var relativeOrder = this.relativeOrder;
    var tileFloor = tile.floor;

    var map = {
        row: tile.row,
        col: tile.col
    }

    for (let f of relativeOrder) {
        let floor = this.floors[f];
        if (floor.id === tileFloor.id) { break; }
        map.row += floor.rows
    }

    return map;

}

Map.prototype.getMapMaxDistance = function() {

    var relativeOrder = this.relativeOrder

    var topFloor = relativeOrder[0];
        topFloor = this.floors[topFloor];

    var bottomFloor = relativeOrder[relativeOrder.length - 1];
        bottomFloor = this.floors[bottomFloor];

    // Get uppper right tile and lower left tile of cave
    var tile1 = topFloor.getTile(0, topFloor.cols - 1);
    var tile2 = bottomFloor.getTile(bottomFloor.rows - 1, 0);

    return this.getMapEuclidDistance(tile1, tile2);
};



Map.prototype.getTileEuclidDistanceOld = function(tile1, tile2) {
    
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
    var endB = ladder.tile[0].id === endA.id ? ladder.tile[1] : ladder.tile[0];
    
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
        this.floors[f].drawBitmapWaterLayer();
        this.floors[f].drawBitmapFloorLayer();
    }
};


Map.prototype.drawBitmapRockLayers = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawBitmapRockLayer();
    }
};

Map.prototype.drawBitmapWaterLayers = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawBitmapWaterLayer();
    }
};

Map.prototype.drawBitmapFloorLayers = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawBitmapFloorLayer();
    }
};

Map.prototype.drawBitmapOverlayLayers = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawBitmapOverlayLayer();
    }
};





Map.prototype.drawRowsCols = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawRowsCols();
    }
    
};

Map.prototype.drawPathLayer = function() {
    
    for (let f in this.floors) {      
        this.floors[f].drawPathLayer();
    }
    
};

Map.prototype.drawVisualizerLayer = function() {
    
    for (let f in this.floors) {   
        this.floors[f].drawVisualizerLayer();
    }
    
};

Map.prototype.createPathfinderFloorLayers = function() {
    
    for (let f in this.floors) {
        this.floors[f].createPathfinderFloorLayers();
    }
};







































/*******************************************/
/**********    Player Methods    ***********/
/*******************************************/























Map.prototype.appendPath = function(color, player) {
    
    var floor = player.tile.floor;
    floor.appendPath(color, player)
    
};











Map.prototype.movePathPointerToSprite = function(game) {
    
  if (1) {
      
        for (let f in this.floors) {
            this.floors[f].appendPath(this.player);
        }
        
  }  
    
};




Map.prototype.initGameboy = function() {
    
    this.gameboy = {};
    
    var canvas = document.getElementById('gameboy');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    
    //var tile_size = canvas.width / 15;
    var tile_size = 16;
    canvas.width = tile_size * 15;
    
    canvas.height = tile_size * 10;
    
    this.gameboy= {
        canvas: canvas,
        ctx: ctx
    };
    
    console.log(this.gameboy);
    
};


Map.prototype.drawGameboy = function(player) {
    
    var floor = player.tile.floor;
    //var frame = floor.frame;
    
    var sx = (player.current.col - 7) * floor.tile_size;
    var sy = (player.current.row - 4.5) * floor.tile_size;
    
    this.gameboy.ctx.drawImage(floor.frame.canvas, sx, sy, floor.tile_size * 15, floor.tile_size * 10, 0, 0, this.gameboy.canvas.width, this.gameboy.canvas.height);
    //ctx.drawSprite()
};

Map.prototype.addRemoveGaps = function(add=true) {
    
  var game = this.game;
  
  for (let g in this.gaps) {
      
      let tile = this.gaps[g].tile;
      
      // Add gaps, turn tiles into LAND
      if (add) {
          tile.type = 'LAND';
          game.addEdgesToNeighbors(tile);      
      }
      // Remove gaps, turn tiles in to ROCK
      else  {
          tile.type = 'ROCK';
          game.removeEdgesToNeighbors(tile);
      }
      
  }
      
};

Map.prototype.getFloors = function() {
    
  return this.floors;  
    
};

Map.prototype.updateMapLayers = function() {
    
    var game = this.game;
    
    this.layers.GRID;
    
    
//    if (game.getPathfinderLayer() === 'PATH') {
//        this.layers.PATHFINDER = 'PATH';
//        this.layers.FRONTIER = false;
//    }
//    else if (game.getPathfinderLayer() === 'FRONTIER') {
//        this.layers.FRONTIER = true;
//        this.layers.PATH = false;
//    }
    
    if (game.getPlayerMoveState() === 'LADDER') {
        this.layers.TRANSITION = true;
    }
    else {
        this.layers.TRANSITION = false;
    }
    
    return;
    
};