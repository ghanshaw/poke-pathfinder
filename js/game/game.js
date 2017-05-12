var Game = function() {
    
    this.ticks = 0;
    this.tile_size = 64;
        
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Game.prototype._________INITIALIZATION_________ = function() {};

// Initialize game and various component parts
Game.prototype.initGame = function() {
    
    // ------ Init Spritesheet ------
    this.initSpritesheet();

    // ------ Init graph ------
    this.initGraph();
    
    // ------ Init Map ------
    this.initMap();
    
    // ------ Init player ------
    this.initPlayer();  
    
    // ------ Init user console ------
    this.initUserConsole();
       
    // ------ Init pathfinder ------
    this.initPathfinder();
       
    // ------ Init monitor ------
    this.initMonitor();
    
    // ------ Init gameboy ------
    this.initGameboy();
    
};

// Initialize Spritesheet
Game.prototype.initSpritesheet = function() {
    this.spritesheet = new SpriteSheet(this, spritesheet_data);
    this.spritesheet.init();   
};

// Initialize Graph
Game.prototype.initGraph = function() { 
    this.graph = new Graph();    
};

// Initialize Map
Game.prototype.initMap = function() {   
    
    // Initialize floors
    var F1 = new Floor(this, F1_data);    
    var F2 = new Floor(this, F2_data);
    var BF1 = new Floor(this, BF1_data)
    F1.init(this.graph);
    F2.init(this.graph);
    BF1.init(this.graph);
    
    
    // Create game map
    this.map = new Map(this, map_data);
    
    // Add floors, and graph, to map
    this.map.init([F1, F2, BF1], this.graph);
   
};

// Initialize Player
Game.prototype.initPlayer = function() {
    
    this.player = new Player(this);
    
    // Defne player's initial location
    var entrance = this.map.keyTiles[0].tile;
    this.player.init(entrance);
};

// Initialize User Console
Game.prototype.initUserConsole = function() {
    this.userConsole = new UserConsole(this);  
    this.userConsole.init();
};

// Initialize Pathfinder
Game.prototype.initPathfinder = function() {
    this.pathfinder = new Pathfinder(this, this.userConsole, this.graph);
    this.pathfinder.init();    
};

// Initalize Monitor
Game.prototype.initMonitor = function() {
    var monitor = new Monitor(this);
    this.monitor = monitor;   
    
    // Actual init method is executed in controller
};


Game.prototype.initGameboy = function() {    
    var gameboy = new Gameboy(this);
    this.gameboy = gameboy;  
    
    // Actual init method is executed in controller
};


//-------------------------------------//
/////////////////////////////////////////
// GAME LOOP METHODS
/////////////////////////////////////////
//-------------------------------------//

Game.prototype._________GAME_LOOP_METHODS________ = function() {};

// Update this fame of the game
Game.prototype.updateGame = function() {
    
    
    // Update pathfinder
    this.updatePathfinder();
    
    // Update player
    this.updatePlayer();  

};

// Render changes in the game to Gameboy or Monitor
Game.prototype.renderGame = function() {
    
    // The 'Screen' here refers to the canvas objects on both
    // the game and the monitor. They are used to draw various effects
    
    // Get game objects
    var floors = this.map.floors;
    var map = this.map;
    var pathfinder = this.pathfinder;
    var player = this.player;
    var userConsole = this.userConsole;
    
    
    // Clear screen from previous iteration
    this.clearScreen();
   
    // Modify screen based on map state
    var MAP_STATE = userConsole.getMapState();  
    this.prepareScreen(MAP_STATE);       
    
    //////////////////////
    // Start rendering
    //////////////////////
    
     // Draw floor layer (if in graphic mode)
    map.drawFloorLayer(MAP_STATE);
    
    // Draw point markers
    pathfinder.drawMarkers();
    
    // Loop through floors
    for (let f in floors) {
 
        // Draw background layers
        pathfinder.drawFrontier(f, 'BACKGROUND');
        pathfinder.drawPath(f, 'BACKGROUND');

        // Draw foreground layers
        pathfinder.drawFrontier(f, 'FOREGROUND');
        pathfinder.drawPath(f, 'FOREGROUND');
        
        // Draw weight layers
        userConsole.drawWeightLayers(f);

    }
    
    // Draw obstacles
    map.drawObstacles();
    
    // Draw Pathfinder drag effect
    pathfinder.drawDrag();
    
    // Draw Player
    player.drawPlayer();
    
    // Draw additional layers that belong to the monitor and gameboy
    this.drawScreenLayers();
    
};

// Set active view (based on location path)
Game.prototype.setView = function(view) {
    this.view = view;
};

// Get active view
Game.prototype.getView = function() {
    return this.view;
};


// Draw additional layers belonging to Gameboy and Monitor
Game.prototype.drawScreenLayers = function() { 
    
    var view = this.getView();

    if (view === "monitor") {
        this.monitor.drawMonitor();
    } else if (view === "gameboy") {
        this.gameboy.drawGameboy();
    }
  
};

// Draw shape directly to either Gameboy or Monitor screen
Game.prototype.drawShapeToScreen = function(img, floorId, tile, color) {
    
    // Get view
    var view = this.getView();

    // Send shape to screen
    if (view === "monitor") {
        this.monitor.drawShapeToScreen(img, floorId, tile, color);
    } else if (view === "gameboy") {
        this.gameboy.drawShapeToScreen(img, floorId, tile, color);
    }
    
};

// Draw image directly to Gameboy or Monitor screen
Game.prototype.drawImageToScreen = function(options) {
    
    // Options object consits of the some or all of the following
    // [img, target, floorId, dof, tile, span, alpha]
    
    var view = this.getView();
    
    if (view === "monitor") {
        this.monitor.drawImageToScreen(options);
    } else if (view === "gameboy") {
        this.gameboy.drawImageToScreen(options);
    }
    
};


// Clear screen on both Monitor and Gameboy
Game.prototype.clearScreen = function() {
    
    // Get active view
    var view = this.getView();
    
    // Clear screen of active view
    if (view === 'monitor') {
        this.monitor.clearScreen();
    }
    else if (view === 'gameboy') {
        this.gameboy.clearScreen();
    }
    
};

// Make modification based on map state
Game.prototype.prepareScreen = function(state) {
  
    var view = this.getView();
    
    if (view === "monitor") {
        this.monitor.prepareMonitor(state);
    } else if (view === "gameboy") {
        this.gameboy.prepareGameboy(state);
    }

};


//-------------------------------------//
/////////////////////////////////////////
// Spritesheet methods
/////////////////////////////////////////
//-------------------------------------//

Game.prototype._________SPRITESHEET_METHODS_________ = function() {};

// Get sprite using spriteOptions
Game.prototype.getSprite = function(spriteOptions) {
    return this.spritesheet.getSprite(spriteOptions);
};

// Get sprite size of spritesheet
Game.prototype.getSpriteSize = function() {
    return this.spritesheet.sprite_size;
};

// Get canvas of spritesheet
Game.prototype.getSpriteSheetCanvas = function() {
    return this.spritesheet.sheet.canvas;
};

// Get x, y coordinates of sprite on the spritesheet
Game.prototype.getSpriteSheetXY = function(spriteOptions) {
   return this.spritesheet.getXY(spriteOptions);
};

// Indicated whether spritesheet images have fully loaded
Game.prototype.hasSpriteSheetLoaded = function() {
    return this.spritesheet.loaded;
};

//-------------------------------------//
/////////////////////////////////////////
// Monitor methods
/////////////////////////////////////////
//-------------------------------------//

Game.prototype._________MONITOR_METHODS_________ = function() {};

// Update placement of pointer on monitor
Game.prototype.setMonitorPointer = function(event, action) {
    
    
    if (action === 'CLICK') {    
        var offsetX = event.offsetX;
        var offsetY = event.offsetY;
    }
    else if (action === 'TOUCH') {
        
        var monitor_offset = $('.monitor.foreground').offset();      
        var offsetX = event.pageX - monitor_offset.left;
        var offsetY = event.pageY - monitor_offset.top;
       
    }
    
    var monitor = this.monitor;
    
    monitor.pointer = {
        x: offsetX,
        y: offsetY,
        target: event.target,
        action: action
    };   
};

// Return Montior pointer
Game.prototype.getMonitorPointer = function() {
    return this.monitor.pointer;
};

// 'Click' of 'Un-click' Monitor: update Monitor's CLICKED flag
Game.prototype.clickMonitor = function(bool) {
    this.monitor.CLICKED = bool;
};

// Check if Monitor was 'clicked', return CLICKED flag
Game.prototype.wasMonitorClicked = function(bool) {
    return this.monitor.CLICKED;
};


//-------------------------------------//
/////////////////////////////////////////
// Player Methods
/////////////////////////////////////////
//-------------------------------------//

Game.prototype.__________PLAYER_METHODS__________ = function() {};

// Update player
Game.prototype.updatePlayer = function() {
    this.player.updatePlayer();
};

// Draw player
Game.prototype.drawPlayer = function() {
    this.player.drawPlayer();
};

// Change direction player is facing
Game.prototype.setPlayerFacing = function(direction) {
    this.player.playerOptions.FACING = direction;
};

// Start dragging player
Game.prototype.startPlayerDrag = function($event) {
    this.player.startDrag($event);
};

// Stop dragging player
Game.prototype.endPlayerDrag = function() {
    this.player.endDrag();
};

// Get top, left offset of player tile
Game.prototype.getPlayerTopLeft = function() {  
    var player = this.player;
    return this.getTileTopLeft(player.tile);
};

// Get player current tile
Game.prototype.getPlayerCurrentTile = function() {
    return this.player.getCurrentTile();
};

// Set player speed
Game.prototype.setPlayerSpeed = function(speed) {
    this.player.factorSpeed = speed;
};

// Get Player Depth-of-field
Game.prototype.getPlayerDOF = function() {
    return this.player.tile.dof;
};

// -------------------------->
// Player State Getter/Setter
// -------------------------->

Game.prototype.getPlayerState = function() {
    return this.player.STATE;
};

Game.prototype.setPlayerState = function(state) {
    this.player.STATE = state;
};

// -------------------------->
// Player Tile Getter/Setter
// -------------------------->

Game.prototype.getPlayerTile = function() {
    return this.player.tile;
};

Game.prototype.setPlayerTile = function(tile) {
    this.player.setTile(tile);
};

// -------------------------->
// Player Gender Getter/Setter
// -------------------------->

Game.prototype.getPlayerGender = function() {
    return this.player.playerOptions.GENDER;    
};

Game.prototype.setPlayerGender = function(GENDER) {
    this.player.playerOptions.GENDER = GENDER;
};


//-------------------------------------//
/////////////////////////////////////////
// Map Methods
/////////////////////////////////////////
//-------------------------------------//


Game.prototype.__________MAP_METHODS__________ = function() {};


// Get maximum diagonal distance within Map
Game.prototype.getMapMaxDistance = function() {
    return this.map.getMapMaxDistance();
};

// Get Euclidian distance between two tiles
Game.prototype.getMapEuclidDistance = function(tile1, tile2) {
    return this.map.getMapEuclidDistance(tile1, tile2);
};

// Get Map floors
Game.prototype.getFloors = function() {
    return this.map.getFloors();
};

// Get Map Water Layer
Game.prototype.getWaterLayer = function() {
  return this.map.waterlayer;  
};

// Get Map Rock Layer
Game.prototype.getRockLayer = function() {
  return this.map.rocklayer;
};

// Get Transition Layer
Game.prototype.getTransitionLayer = function() {
  return this.map.transitionlayer;    
};

// Get tile of a specific obstacle
Game.prototype.getObstacle = function(id) {
    return this.map.obstacles.tiles[id].tile;    
};

// Check if floor has any water
Game.prototype.floorHasWater = function(floorId) {
    return this.map.floors[floorId].hasWater();
};

// Get Monitor anchors
Game.prototype.getMonitorAnchors = function() {
    return this.monitor.anchors;
};

// -------------------------->
// Transition Opacity Getter/Setter
// -------------------------->

Game.prototype.getTransitionOpacity = function() {
    return this.transitionOpacity;
};

Game.prototype.setTransitionOpacity = function(opacity) {
    this.transitionOpacity = opacity;
};


//-------------------------------------//
/////////////////////////////////////////
// User Console Methods
/////////////////////////////////////////
//-------------------------------------//


Game.prototype.__________USER_CONSOLE_METHODS__________ = function() {};

// Send message to User Console log
Game.prototype.logToUserConsole = function(text) {
    this.userConsole.log(text);
};

// Get key tile associated with id
Game.prototype.getKeyTile = function(id) {
    return this.map.keyTiles[id].tile;
};

// Get Map state
Game.prototype.getMapState = function() {
    return this.userConsole.getMapState();  
};

// Get movement direction
Game.prototype.getDirection = function() {
    return this.userConsole.input.direction;
};

// Set Source Location to id
Game.prototype.setUserConsoleSourceLocation = function(id) {
    this.userConsole.setSourceLocation(id);
};

// Set Target Location to id
Game.prototype.setUserConsoleTargetLocation = function(id) {
    this.userConsole.setTargetLocation(id);
};


//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//


Game.prototype.__________TILE_METHODS__________ = function() {};

// Return Game tile size
Game.prototype.getTileSize = function() {
    return this.tile_size;
};

// Get tile using floor, row and column
Game.prototype.getTile = function(floor, row, col) {
    return this.map.getTile(floor, row, col);
};

// Get top, left offsets of tile
Game.prototype.getTileTopLeft = function(tile) {
    return this.map.getTileTopLeft(tile);    
};

// Get tile corresponding to location of Monitor pointer
Game.prototype.getTileFromMonitorPointer = function() {
    return this.monitor.getTileFromPointer();  
};

// Get tile from tileId
Game.prototype.getTileFromId = function(tileId) {
    return this.map.getTileFromId(tileId);
};

// Get tile of other end of an ladder
Game.prototype.getTileOtherEndLadder = function(endA) {
    return this.map.getTileOtherEndLadder(endA);
};


//-------------------------------------//
/////////////////////////////////////////
// Pathfinder Methods
/////////////////////////////////////////
//-------------------------------------//


Game.prototype.__________PATHFINDER_METHODS__________ = function() {};

// Start Pathfinder
Game.prototype.startPathfinder = function(mode) {
    this.pathfinder.startPathfinder(mode);
};

// Clear Pathfinder
Game.prototype.clearPathfinder = function() {
    this.pathfinder.clearPathfinder();
};

// Update Pathfinder
Game.prototype.updatePathfinder = function() {
    this.pathfinder.updatePathfinder();
};

// Get Source/Target Location tile
Game.prototype.getUserConsoleLocationTile = function(sourceTarget) {
    return this.userConsole.getLocationTile(sourceTarget);    
};

// Handle VCR command
Game.prototype.handleVCRCommand = function(COMMAND) {
    this.pathfinder.handleVCRCommand(COMMAND);
};

// Get User Console algorithm
Game.prototype.getUserConsoleAlgorithm = function() {
    return this.userConsole.selectedAlgorithm;
};

// Get edge weights from User Console
Game.prototype.getEdgeWeights = function() {
    return this.userConsole.edgeweight;
};

// Start PointMarker Drag Mode
Game.prototype.startPointMarkerDrag = function($event) {
    this.pathfinder.startDragMode($event);
};

// End PointMarker Drag Mode
Game.prototype.endPointMarkerDrag = function() {
    this.pathfinder.endDragMode();
};

// Determine if Grid if visible
Game.prototype.isGridVisible = function() {
    return this.userConsole.isGridVisible();
};

// Determine if Pathfinder layer exists
Game.prototype.hasPathfinderLayer = function(layer) {
    return this.pathfinder.hasLayer(layer);
};

// Get Source/Target PointMarker tile
Game.prototype.getPointMarkerTile = function(sourceTarget) {
    if (sourceTarget === 'SOURCE') {
        return this.pathfinder.pointmarker.source.tile;
    } else if (sourceTarget === 'TARGET') {
        return this.pathfinder.pointmarker.target.tile;
    }
};

// -------------------------->
// Pathfinder Mode Getter/Setter
// -------------------------->

Game.prototype.getPathfinderMode = function() {
    return this.pathfinder.getMode();
};

Game.prototype.setPathfinderMode = function(mode) {
    this.pathfinder.setMode(mode);
};

//-------------------------------------//
/////////////////////////////////////////
// Graph Methods
/////////////////////////////////////////
//-------------------------------------//

Game.prototype.__________GRAPH_METHODS__________ = function() {};

// Get random tile on graph
Game.prototype.getRandomTile = function() {
    
    // Get all nodes in graph
    var tileIds = Object.keys(this.graph.adj);
    var length = tileIds.length;
    
    // Get tile from node at index
    var index = 0;
    var tile = this.getTileFromId(tileIds[index]); 
    
    // Randomly choose tile that isn't rock or an obstacle
    while (tile.type === 'ROCK' &&
            !tile.obstacle) {
        
        index = Math.floor(length * Math.random());
        tile = this.getTileFromId(tileIds[index]);
      
    }
    
    return tile;   
};

// Remove edges from neighbors
Game.prototype.removeEdgesToNeighbors = function(tile) {
    
    // Get graph
    var graph = this.graph;
    
    // Get row and column of tile
    var r = tile.row;
    var c = tile.col;
    
    // Get neighbors
    var neighbors = [];
    neighbors.push([r-1, c]);
    neighbors.push([r+1, c]);
    neighbors.push([r, c-1]);
    neighbors.push([r, c+1]);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        // Get neighbors tile
        let row = neigh[0];
        let col = neigh[1];
        let nTile = this.getTile(tile.floor, row, col);
        
        // If neighbor tile exists
        if (nTile) {
            // Remove edge between tile and neighbor tile
            graph.removeEdge(tile.id, nTile.id);
            graph.removeEdge(nTile.id, tile.id);
        }
    }     
    
};


// Add edges to neighbors
Game.prototype.addEdgesToNeighbors = function(tile) {
    
    // Get graph
    var graph = this.graph;
    
    // Get row and column of tile
    var r = tile.row;
    var c = tile.col;
    var neighbors = [];
    
    // Get neighbors
    neighbors.push([r-1, c]);
    neighbors.push([r+1, c]);
    neighbors.push([r, c-1]);
    neighbors.push([r, c+1]);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        // Get neighbor tile
        let row = neigh[0];
        let col = neigh[1];       
        let nTile = this.getTile(tile.floor, row, col);
        
        // If neighbor tile exists is valid
        if (nTile 
                && nTile.type !== "ROCK"
                && !nTile.obstacle) {
            
            // Add edges between tiles
            graph.addEdge(tile.id, nTile.id);
            graph.addEdge(nTile.id, tile.id);
        }
    } 
};

// Check if edge exists between two tiles
Game.prototype.hasEdge = function(tile1, tile2) {
    return this.graph.hasEdge(tile1.id, tile2.id);
};

//-------------------------------------//
/////////////////////////////////////////
// Utilities
/////////////////////////////////////////
//-------------------------------------//

Game.prototype.__________UTILITIES__________ = function() {};

// Get game ticks
Game.prototype.getTicks = function() {
    return this.ticks;
};

// Create blank canvas and context
Game.prototype.createCanvasCtx = function(canvas) {
    
    // Create new layer
    var newCanvas = document.createElement('canvas');
    var newCtx = newCanvas.getContext('2d');
    
    // Implement Nearest Neighbor scaling
    newCtx.mozImageSmoothingEnabled = false;
    newCtx.webkitImageSmoothingEnabled = false;
    newCtx.msImageSmoothingEnabled = false;
    newCtx.imageSmoothingEnabled = false;
    
    // Update width and height
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    // Assign random id to canvas and context
    newCanvas.id = Math.random() * 10;
    newCtx.id = newCanvas.id;
    
    var canvas_ctx = {
        canvas: newCanvas,
        ctx: newCtx
    };
    
    return canvas_ctx;   
};


// Change Hex volor to RGBA object, add alpha
Game.prototype.hexToRgba = function(hex, alpha){
    
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return {
            red: (c >> 16) & 255,
            green: (c >> 8) &255,
            blue: c & 255,
            alpha: alpha
        };
    }
    throw new Error('Bad Hex');
    
};

// Stringify rgba object
Game.prototype.rgbaToString = function(rgba) {   
    return 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ',' + rgba.alpha + ')';   
};

// Interpolate color value between two colors using percent
Game.prototype.interpolateColor = function(color1, color2, alpha, percent) {
    
    var resultRed = color1.red + percent * (color2.red - color1.red);
    var resultGreen = color1.green + percent * (color2.green - color1.green);
    var resultBlue = color1.blue + percent * (color2.blue - color1.blue);
    
    resultRed = Math.floor(resultRed);
    resultGreen = Math.floor(resultGreen);
    resultBlue = Math.floor(resultBlue);    
    
    var rgba = 'rgba(' + resultRed + ', ' + resultGreen + ', ' + resultBlue + ',' + alpha + ')';
    
    return rgba;     
};
