var Map = function(game, map_data) {
    
    this.game = game;
    this.map_data = map_data;
    
    // Create object to hold floors
    this.floors = {};

    // Order of floors in Monitor view
    // Used to determine distances across floors
    this.relativeOrder = [ 'F2', 'F1', 'BF1' ]; 
    
    // Store references to image objects
    this.rocklayer = {};   
    this.waterlayer = [];   
    this.transitionlayer = {};
    
    // Location and sprite details of obstacles
    this.obstacles = {
        tiles: [],
        spriteOptions: {
            TYPE: 'OBSTACLE',
            LABEL: 'MEWTWO'
        }
    };
    
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Map.prototype._________INITIALIZATION_________ = function() {};


// Initialize Map object
Map.prototype.init = function(floors, graph) {
       
    // Add floors to map
    for (let f of floors) {  
        this.addFloor(f);
    }
    
    // Add map data to map
    this.addMapData();
    
    // Add map data to graph
    this.addMapToGraph(graph);
    
    // Create map layers
    this.initMapLayers();
    
    // Create floor layers
    for (let f in this.floors) {  
        this.floors[f].initFloorLayer();
    }
    
    
};

Map.prototype.initMapLayers = function(graph) {
    
    //var imgId;
    var img;
    
    // Get rocklayer PNG image from DOM
    var rocklayer = this.map_data.rocklayer();
    img = document.getElementById(rocklayer.id);
    
    this.rocklayer = {
        img: img,
        rows: rocklayer.rows,
        cols: rocklayer.cols
    };
    
    // Get waterlayer PNG images from DOM
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
    
    // Get transition layer PNG image from DOM
    var transitionlayer = this.map_data.transitionlayer();
    img = document.getElementById(transitionlayer.id);
    this.transitionlayer = {
        img: img
    };
    
};


// Get Map level data, add to object
Map.prototype.addMapData = function() {
    
    // Extract key tile data
    this.keyTiles = map_data.keyTiles();
    
    // Turn tiles into tile objects
    for (let keyT of this.keyTiles) {
        var tileId = keyT.tile.toString();
        keyT.tile = this.getTileFromId(tileId);   
    }
    
    // Extract ladders
    this.ladders = map_data.ladders();
    
    // Turn ladders into tile objects
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
    
    // Extract obstacle data
    this.obstacles.tiles = map_data.obstacles();
    
    // Turn obstacles into tile objects
    for (let ob of this.obstacles.tiles) {
        var tileId = ob.tile.toString();
        ob.tile = this.getTileFromId(tileId);   
        
        // If obstacle is active (not being ignored)
        if (ob.active) {
            // Turn tile into obstacle
            ob.tile.obstacle = true;
            ob.tile.obstacleId = ob.id;
        }      
    }
};

// Add a floor to the map
Map.prototype.addFloor = function(floor) {
    // If floor has not yet been added
    if (!this.floors.hasOwnProperty(floor.id)) {        
        // Add floor to map
        this.floors[floor.id] = floor;
    }  
};

// Add madp data to graph
Map.prototype.addMapToGraph = function(graph) {
    
    // Loop through floors
    for (let f in this.floors) {
        // Add floor data to graph
        this.floors[f].addFloorToGraph(graph);
    }

    // Add edges between ladders 
    for (let l in this.ladders) {
        let ladder = this.ladders[l];
        let endA = ladder.tile[0];
        let endB = ladder.tile[1];
        
        graph.addEdge(endA.id, endB.id); 
        graph.addEdge(endB.id, endA.id);
    }    
};


//-------------------------------------//
/////////////////////////////////////////
// Obstacles
/////////////////////////////////////////
//-------------------------------------//

Map.prototype._________OBSTACLES_________ = function() {};

// Draw obstacles to Screen
Map.prototype.drawObstacles = function() {
    
    var game = this.game;
    
    // Loop through obstaces
    for (let ob of this.obstacles.tiles) {
        if (ob.active) {
            
            // Get obstacle tile and floor
            let tile = ob.tile;
            let floorId = ob.tile.floor.id;
            let dof = tile.dof;
            
            // If in 'GRAPHIC' state, draw star
            if (this.game.getMapState() === 'GRAPHIC') {
                game.drawShapeToScreen('star', floorId, tile);
                return;
            }
            
            // Update sprite options, get sprite
            let label = ob.label;
            let spriteOptions = this.obstacles.spriteOptions;
            spriteOptions.LABEL = label;
            let sprite = game.getSprite(spriteOptions);
            
            // Draw sprite to Screen
            let options = {
                image: 'spritesheet',
                floorId: floorId,
                dof: dof,
                tile: tile,
                span: 2,
                target: 'tile',
                spriteOptions: spriteOptions
            };
 
            game.drawImageToScreen(options);
        }
    }
};


/*****************************************/
/**********    Tile Methods    ***********/
/*****************************************/


Map.prototype._________TILE_METHODS_________ = function() {};


// Get tile with floor, row and column
Map.prototype.getTile = function(floor, row, col) {
    
    // Return error if floor does not exist
    if (!this.floors.hasOwnProperty(floor.id)) {
        console.error('Missing floor');
        return null;
    }
    
    var floor = this.floors[floor.id];
    return floor.getTile(row, col);
    
};

// Get tile using tile id
Map.prototype.getTileFromId = function(tileId) {
    
    // Return if tileId is invalid (null or undefined)
    if (!tileId) { return; }
    
    // Split string at comma
    var tile_arr = tileId.split(',');
    var floorId = tile_arr[0];
    
    // Get tile using component parts
    return this.floors[floorId].getTile(tile_arr[1], tile_arr[2]);
};


// Get Euclidian distance between two tiles
Map.prototype.getMapEuclidDistance = function(tile1, tile2) {

    // If argument is tile id, get tile
    if (typeof tile1 === 'string') {
        tile1 = this.getTileFromId(tile1);
    }

    // If argument is tile id, get tile
    if (typeof tile2 === 'string') {
        tile2 = this.getTileFromId(tile2);
    }

    // Get row, column of tile if map were contiguous
    var map1 = this.getMapRowCol(tile1);
    var map2 = this.getMapRowCol(tile2);

    // Use pythagorean to get distance
    var deltaX = map1.col - map2.col;
        deltaX = Math.pow(deltaX, 2);

    var deltaY = map1.row - map2.row;
        deltaY = Math.pow(deltaY, 2);

    var distance = deltaX + deltaY;
        distance = Math.pow(distance, 0.5);

    return distance;

};

// Get row, column of tile in continguous map
Map.prototype.getMapRowCol = function(tile) {

    // Relative position of floors
    var relativeOrder = this.relativeOrder;
    
    // Tile's floor
    var tileFloor = tile.floor;

    var map = {
        row: tile.row,
        col: tile.col
    };

    // Increase row to location in continguous version of cave
    for (let f of relativeOrder) {
        let floor = this.floors[f];
        if (floor.id === tileFloor.id) { break; }
        map.row += floor.rows;
    }

    return map;

};

// Get maxium diagonal distance between two tiles
Map.prototype.getMapMaxDistance = function() {

    // Relative position of floors
    var relativeOrder = this.relativeOrder;

    // Get top floor
    var topFloor = relativeOrder[0];
        topFloor = this.floors[topFloor];

    // Get bottom floor
    var bottomFloor = relativeOrder[relativeOrder.length - 1];
        bottomFloor = this.floors[bottomFloor];

    // Get uppper right tile and lower left tile of cave
    var tile1 = topFloor.getTile(0, topFloor.cols - 1);
    var tile2 = bottomFloor.getTile(bottomFloor.rows - 1, 0);

    // Get distance between two distant tiles
    return this.getMapEuclidDistance(tile1, tile2);
};

// Get other end of ladd with tile
Map.prototype.getTileOtherEndLadder = function(endA) {
    
    // Get the ladder associated with this tile
    var ladderId = endA.ladderId;
    var ladder = this.ladders[ladderId];
    
    // Select tile on other end of ladder
    var endB = ladder.tile[0].id === endA.id ? ladder.tile[1] : ladder.tile[0];
    
    return endB;   
};


/*****************************************/
/**********    Floor Methods    **********/
/*****************************************/


Map.prototype._________FLOOR_METHODS_________ = function() {};

// Draw the floorlayer if 'GRAPHIC' state is active
Map.prototype.drawFloorLayer = function(state) {    
    if (state === 'GRAPHIC') {      
        for (let f in this.floors) {
            this.floors[f].drawFloorLayer();
        }       
    }
};

// Return all floors
Map.prototype.getFloors = function() {   
  return this.floors;      
};
