var Pathfinder = function(game, userConsole, graph) {
    
    // Attach game objects
    this.game = game;
    this.graph = graph;
    this.userConsole = userConsole;


    // Layer objects for Path and Frontier layers
    this.layer = {
        path: {
            exists: false
        },
        frontier: {
            exists: false
        }
    };
    
    // Define path and frontier layers for each floor
    this.floors = {};
    
    // Color variables used for Path and Frontier layers
    this.alpha = 0.7;
    this.hexPath = "#55ecff";
    this.hexFrom = "#FFFFFF";
    this.hexTo = "#E91E63";
    this.hexOpen = "#FFC107";
    
    // Mode variable
    this.MODE = 'OFF';
    
    // PointMarker object
    this.pointmarker = {};

    
    // Source and Target tiles
    this.source = {
        tile: null
    };
    this.target = {
        tile: null,
        all: false
    };
    
    // List of directions used by player to follow path
    this.inputDirectionList = [];
    
    // Drag Tile
    this.dragTile;
    
    // Game level tile size
    this.tile_size = game.getTileSize();
 
};


//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//


Pathfinder.prototype._________INITIALIZATION_________ = function() {};

// Intitalize Pathfinder object
Pathfinder.prototype.init = function() {
    
    var game = this.game;
    
    // Get initial source and target locations
    this.source.tile = this.game.getPlayerTile();
    this.target.tile = this.game.map.keyTiles[1].tile;
    this.target.all = false;
    
    // If target is an obstacle, move target to one of its neighbors
    if (this.target.tile.obstacle) {
        var neighbors = this.game.graph.getNeighbors(this.target.tile.id);
        var tileId = neighbors[0];
        this.target.tile = this.game.getTileFromId(tileId);
    } 
    
    // Define size of new blank canvas
    var canvasSize = {
        width: 100,
        height: 100
    };

    // Create reusable arrow canvas
    this.arrow = game.createCanvasCtx(canvasSize);

    // Create reusable pointmarker canvases
    var source = game.createCanvasCtx(canvasSize);
    var target = game.createCanvasCtx(canvasSize);

    // Attach canvases and tiles to pointmarker objects
    this.pointmarker = {
        source: {
            tile: this.source.tile,
            canvas: source.canvas,
            ctx: source.ctx
        },
        target:  {
            tile: this.target.tile,
            canvas: target.canvas,
            ctx: target.ctx
        }       
    };
    
    // Execute additional intializaton functions
    this.initPointMarkerVisuals();
    this.initPathfinderFloorLayers();
    
};

// Initialize visuals of point marker
Pathfinder.prototype.initPointMarkerVisuals = function() {

    // Create source visual marker
    var marker = this.pointmarker.source;
    var marker_size = marker.canvas.width;

    marker.ctx.shadowBlur = marker_size;
    marker.ctx.shadowColor = "#00ff0b";
    marker.ctx.fillStyle = "rgba(109, 255, 115, .5)";
    marker.ctx.strokeStyle = "#4CAF50";
    marker.ctx.lineWidth = 4;

    // Draw green circular source marker
    marker.ctx.beginPath();
    marker.ctx.arc(marker_size/2, marker_size/2, marker_size/5, 0, 2*Math.PI);
    marker.ctx.fill();
    marker.ctx.stroke();

    // Create target visual marker
    marker = this.pointmarker.target;
    var marker_size = marker.canvas.width;


    // Draw checkered target marker
    var length = 12;
    var cube = marker_size/length;
    marker.ctx.fillStyle = "rgba(0, 0, 0, .5)";
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            if (i % 2 === 0 && j % 2 === 0 ||
                    i % 2 !== 0 && j % 2 !== 0) {
                marker.ctx.fillStyle = "rgba(0, 0, 0, .5)";
            }
            else {
                marker.ctx.fillStyle = "rgba(255, 255, 255, .5)";
            }

            marker.ctx.fillRect(i * cube, j * cube, cube, cube);
        }
    } 

    // Slice out the shape of a marker
    marker.ctx.globalCompositeOperation = 'destination-in';
    marker.ctx.fillRect((1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size);


    //Place white glow beneath marker
    marker.ctx.globalCompositeOperation = 'destination-over';
    marker.ctx.shadowBlur = marker_size;
    marker.ctx.shadowColor = "#FFFFFF";
    marker.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    marker.ctx.strokeStyle = "rgba(255, 255, 255, .5)";   
    marker.ctx.fillRect((1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size);
    marker.ctx.globalCompositeOperation = 'source-over';

};


Pathfinder.prototype.initPathfinderFloorLayers = function() {
    
    
    var floors = this.floors;
    var map = this.game.map;
    var game = this.game;
    
    // Create a canvas object for each floor in the map
    for (let f in map.floors) {
        
        var floor = map.floors[f];
        var id = floor.id;

        // Define size of canvas
        let layerSize = {
            width: floor.cols * this.tile_size,
            height: floor.rows * this.tile_size
        };     

        // Create canvas for both foreground and background
        var frontierlayer = {
            background: game.createCanvasCtx(layerSize),
            foreground: game.createCanvasCtx(layerSize)
        };

        var pathlayer = {
            background: game.createCanvasCtx(layerSize),
            foreground: game.createCanvasCtx(layerSize) 
        };

        // Attach canvases to Pathfinder object
        floors[id] = {};
        floors[id].tile_size = this.tile_size;
        floors[id]['frontierlayer'] = frontierlayer;
        floors[id]['pathlayer'] = pathlayer;    
    }  
};


//////////////////////////////////////////
//**************************************//
// Pathfinder Layer Methods
//**************************************//
//////////////////////////////////////////

Pathfinder.prototype._________PATHFINDER_LAYER_METHODS_________ = function() {};

// Indicate whether Pathfinder layer exists
Pathfinder.prototype.hasLayer = function(layer) {
    if (layer === 'PATH') {
        return this.layer.path.exists;
    } else if (layer === 'FRONTIER') {
        return this.layer.frontier.exists;
    }
};

//////////////////////////////////////////
//**************************************//
// Pathfinder Mode Methods
//**************************************//
//////////////////////////////////////////

Pathfinder.prototype._________PATHFINDER_MODE_METHODS_________ = function() {};

// Get Pathfinder Mode
Pathfinder.prototype.getMode = function() {
    return this.MODE;
};

// Set Pathfinder Mode
Pathfinder.prototype.setMode = function(mode) {
    this.MODE = mode;
};

// Start Pathfinder, redirect to proper function
Pathfinder.prototype.startPathfinder = function(mode) {
     
     
    if (mode === 'PLACE SOURCE' ||
            mode === 'PLACE TARGET') {    
        this.startPlaceMode(mode); 
    }
    
    // These modes are started directly by Montior Controller
    if (mode === 'DRAG SOURCE' ||
            mode === 'DRAG TARGET') {}
       
    
    else if (mode === 'FRONTIER' ||
            mode === 'FOLLOW PATH') {
        this.startFrontierFollowPathMode(mode);
    }
    
};

// Update pathfinde, redirect to proper function
Pathfinder.prototype.updatePathfinder = function() {
    
    var userConsole = this.userConsole;    
    
    if (this.MODE === 'PLACE SOURCE' ||
            this.MODE === 'PLACE TARGET') {
        this.updatePlaceMode();
    }
    
    if (this.MODE === 'DRAG SOURCE' ||
            this.MODE === 'DRAG TARGET') {
        this.updateDragMode();
    }
    
    var vcrCommand = userConsole.getVCRCommand();
    
    if (vcrCommand === 'PLAY' ||
            vcrCommand === 'STEP') {
        
        if (this.MODE === 'FRONTIER') {
            this.updateFrontierMode();
        } 
        
        else if (this.MODE === 'FOLLOW PATH') {
            this.updateFollowPathMode();
        } 
        
        if (vcrCommand === 'STEP') {
            userConsole.setVCRCommand('PAUSE');
            return;
        }
        
    }
    
    if (vcrCommand === 'PAUSE') {
        userConsole.setDirection(null);
        return;
    }  
    
};


// Clear pathfinder, redirect to proper function
Pathfinder.prototype.clearPathfinder = function() {
    
    var userConsole = this.userConsole;    
    var floors = this.floors;

    // Clear path and frontier layers of each floor
    for (let f in floors) {

        // Get Path and Frontier layers
        let frontierlayer = floors[f].frontierlayer; 
        let pathlayer = floors[f].pathlayer; 

        // Aquire width and height
        let width = frontierlayer.background.canvas.width;
        let height = frontierlayer.background.canvas.height;

        // Clear each layer
        frontierlayer.background.ctx.clearRect(0, 0, width, height);
        frontierlayer.foreground.ctx.clearRect(0, 0, width, height);

        pathlayer.background.ctx.clearRect(0, 0, width, height);
        pathlayer.foreground.ctx.clearRect(0, 0, width, height);
    }
    
    // Indicate that neither layer exists
    this.layer.path.exists = false;
    this.layer.frontier.exists = false;
   
   
    // Turn off Pathfinder
    this.MODE = 'OFF';
    
    // Set 'All Tiles' flag to false
    this.target.all = false;
     
    // Hide both layers
    userConsole.showPathfinderLayer('PATH', false);
    userConsole.showPathfinderLayer('FRONTIER', false);
    
    // Update User Console 
    userConsole.setDirection(null);
    //this.game.KEYPRESS = null;
    userConsole.setVCRCommand(null);
    
};


//////////////////////////////////////////
//**************************************//
// Place Mode Methods
//**************************************//
//////////////////////////////////////////


Pathfinder.prototype._________PLACE_MODE_METHODS_________ = function() {};

// Start Pathfinder Place Mode
Pathfinder.prototype.startPlaceMode = function(mode) {
    
    var userConsole = this.userConsole;
    var game = this.game;
    
    // Cannot switch from these mode to Place mode
    if (this.MODE === 'FRONTIER' ||
            this.MODE === 'FOLLOW PATH') { return; }
        
    
    // Just clicked 'PLACE SOURCE'
    if (mode === 'PLACE SOURCE') {
        
        // Was already 'PLACE SOURCE' --> 'PLACE SOURCE' : deactivate
        if (this.MODE === 'PLACE SOURCE') {
            
            // Revert to original value
            this.pointmarker.source.tile = this.source.tile;
            
            // Show source PointMarker
            userConsole.showPointMarker('SOURCE', true);
            
            // Turn Pathfinder off
            this.MODE = 'OFF';
            return;   
        }
        
        // Was already 'PLACE TARGET' --> 'PLACE SOURCE' : switch
        if (this.MODE === 'PLACE TARGET') {
            
            // If clicking while other PLACE mode is active, switch
            this.pointmarker.target.tile = this.target.tile;
            userConsole.showPointMarker('TARGET', true);

        }

        // Was 'OFF' or 'PLACE TARGET' --> 'PLACE SOURCE' : activate 
        
        // Unclick monitor
        game.clickMonitor(false); 
        
        // Show source PointMarker
        userConsole.showPointMarker('SOURCE', false);
        
        // Start Pathfinder
        this.MODE = 'PLACE SOURCE';
        return;      
    }

    // Just clicked 'PLACE TARGET'
    if (mode === 'PLACE TARGET') {
            
        // Was already 'PLACE TARGET' --> 'PLACE TARGET' : deactivate    
        if (this.MODE === 'PLACE TARGET') {
           
            // Revert to old target tile
            this.pointmarker.target.tile = this.target.tile;
            
            // Show target PointMarker
            userConsole.showPointMarker('TARGET', true);
            
            // Turn off Pathfinder
            this.MODE = 'OFF';
            return;
        } 
        
        // 'PLACE SOURCE' --> 'PLACE TARGET ' : switch
        if (this.MODE === 'PLACE SOURCE') {        
            
            // If clicking while other PLACE mode is active, switch
            this.pointmarker.source.tile = this.source.tile;
            userConsole.showPointMarker('SOURCE', true);
        }
        
        // 'OFF' or 'PLACE SOURCE' --> 'PLACE TARGET' : activate
        
        // Unclick Monitor
        game.clickMonitor(false); 
        
        // Hide pointmarker
        userConsole.showPointMarker('TARGET', false);
        
        // Turn on Pathfinder
        this.MODE = 'PLACE TARGET';
        return;
    }   
};


// Update Place Mode
Pathfinder.prototype.updatePlaceMode = function() {
    
    var game = this.game;
    var userConsole = this.userConsole;

    
    // Find tile corresponding to monitor pointer placement
    var tile = game.getTileFromMonitorPointer();
    
    // Get pointmarker based on what you're selecting
    var marker = this.MODE === 'PLACE SOURCE' ? this.pointmarker.source : this.pointmarker.target;
    var point = this.MODE === 'PLACE SOURCE' ? 'SOURCE' : 'TARGET';

    // If pointer is over a valid tile
    if (tile 
            && tile.type !== 'ROCK'
            && !tile.obstacle) {
        
        // Move marker to that tile
        marker.tile = tile;
        marker.valid = true;
        
        // Show marker
        userConsole.showPointMarker(point, true);
        
    } else {
        
        // Indicat that marke is invalid
        marker.valid = false;
        
        // Hide pointmarker
        userConsole.showPointMarker(point, false);  
    }
    
    // End Place Mode when monitor has been clicked
    if (game.wasMonitorClicked()) { 
        this.endPlaceMode(); 
        return;
    };
   
};


// End Place Mode
Pathfinder.prototype.endPlaceMode = function() {
    
    var game = this.game;
    var userConsole = this.userConsole;
    
    let marker;
    // Update Source Pointmarker
    if (this.MODE === 'PLACE SOURCE') {
        marker = this.pointmarker.source;
        
        // If pointmarker is over valid tile
        if (marker.valid) {
            
            // Update source to marker
            this.source.tile = marker.tile;
            userConsole.showPointMarker('SOURCE', true);
            
            // Update source location to 'Current Marker' on User Console
            userConsole.setLocationTile('SOURCE', 4);
        }
        else {
            // Revert marker to its original location
            marker.tile = this.source.tile;
            userConsole.showPointMarker('SOURCE', true);
        }
    }
    
    // Update target Pointmarker
    else if (this.MODE === 'PLACE TARGET') {
        marker = this.pointmarker.target;
        
        // If pointermarker is over valid tile
        if (marker.valid) {
            // Update target to  marker
            this.target.tile = marker.tile;
            
            userConsole.showPointMarker('TARGET', true);
            
            // Update target location to 'Current Marker' on User Console
            userConsole.setLocationTile('TARGET', 4);
        }
        else {
            marker.tile = this.target.tile;
            userConsole.showPointMarker('TARGET', true);
        }
    }
     // Turn off Pathfinder
    this.MODE = 'OFF';
    
    // Unclick monitor
    game.clickMonitor(false);
    return;   
    
};

//////////////////////////////////////////
//**************************************//
// Drag Mode Methods
//**************************************//
//////////////////////////////////////////

Pathfinder.prototype._________DRAG_MODE_METHODS_________ = function() {};

// Start Drag Mode
Pathfinder.prototype.startDragMode = function($event) {
    
    var game = this.game;
    var userConsole = this.userConsole;

    // If Pathfinder is off and player isn't moving
    if (game.getPlayerState() === 'STILL' &&
            this.MODE === 'OFF') {
        
        // Get tile associated with pointer on monitor
        let pointerTile = game.getTileFromMonitorPointer();
        
        // If pointer is over Source PointMarker
        if (pointerTile.id === this.pointmarker.source.tile.id &&
                userConsole.isPointMarkerVisible('SOURCE')) {
            this.MODE = 'DRAG SOURCE';
            
            // Hide point marker
            userConsole.showPointMarker('SOURCE', false);
        }    
        
        else if (pointerTile.id === this.pointmarker.target.tile.id &&
                userConsole.isPointMarkerVisible('TARGET')) {
            this.MODE = 'DRAG TARGET';
            
            // Hide point marker
            userConsole.showPointMarker('TARGET', false);
        }
    }
};

// Update Drag Mode
Pathfinder.prototype.updateDragMode = function($event) {
    
    var game = this.game;   
    var tile = game.getTileFromMonitorPointer();
 
    // If tile is valid
    if (tile 
            && tile.type !== "ROCK"
            && !tile.obstacle) {      
        
        // Update drag tile to tile
        this.dragTile = tile;       
    }
    else {
        // Make drag tile null
        this.dragTile = null;
    }
    
};

// End Drag Mode
Pathfinder.prototype.endDragMode = function() {
    
    var userConsole = this.userConsole;
    
    // Don't do anything if you're not in drag mode
    if (this.MODE !== 'DRAG SOURCE' &&
            this.MODE !== 'DRAG TARGET' ) { return; }
    
    
    // If in Drag Source Mode
    if (this.MODE === 'DRAG SOURCE') {
        
        // If drag tile is valid
        if (this.dragTile) {
            
            // Move point marker to drag tile
            this.pointmarker.source.tile = this.dragTile;
            
            // Update source location to 'Current Marker' on User Console
            userConsole.setLocationTile('SOURCE', 4);
        }
        
        // Enable and show point marker
        userConsole.enablePointMarker('SOURCE', true);
        userConsole.showPointMarker('SOURCE', true);
    }
    
    else if (this.MODE === 'DRAG TARGET') {
        
        // If drag tile is valid
        if (this.dragTile) {
            
            // Movepoint marker to drag tile
            this.pointmarker.target.tile = this.dragTile;   
            
            // Update target location to 'Current Marker' on User Console
            userConsole.setLocationTile('TARGET', 4);
        }
        
        // Enable and show point marker
        userConsole.enablePointMarker('TARGET', true);
        userConsole.showPointMarker('TARGET', true);
    }    
    
    this.MODE = 'OFF';
    
};

// Draw PointMarkers in drag location
Pathfinder.prototype.drawDrag = function() {
  
    // Aquire source or target pointmarker canvas
    var canvas = null;
    if (this.MODE === 'DRAG SOURCE') {
        canvas = this.pointmarker.source.canvas;
    }
    else if (this.MODE === 'DRAG TARGET') {
        canvas = this.pointmarker.target.canvas;
    }
  
    // If canvas exists, and tile is valid
    if (canvas && this.dragTile) {
       
        // Get tile depth-of-field
        let dof = this.dragTile.dof;
        
        // Draw tile to screen
        let options = {
            image: canvas,
            target: 'tile',
            floor: this.dragTile.floor.id, 
            dof: dof, 
            tile: this.dragTile,
            span: 2
        };
        this.game.drawImageToScreen(options);
    }    
};


//////////////////////////////////////////
//**************************************//
// FIND PATH/FRONTIER Mode Methods
//**************************************//
//////////////////////////////////////////


Pathfinder.prototype._________FOLLOW_PATH__FRONTIER_METHODS_________ = function() {};

// Start Frontier or Follow Path Modes
Pathfinder.prototype.startFrontierFollowPathMode = function(mode) {
     
    // Cannot switch from PLACE modes to FRONTIER or FOLLOW PATH modes  
    if (this.MODE === 'PLACE SOURCE' ||
            this.MODE === 'PLACE TARGET') { 
        
        this.endPlaceMode();
        return;    
    }
   
    // Get game objects
    var game = this.game;
    var userConsole = this.game.userConsole;
    
    // Turn off pathfinder, if in progress
    this.clearPathfinder();
   
    // Get algorithm from User Console
    this.algorithm = userConsole.getSelectedAlgorithm();
    
    // Get source and target from User Console
    this.source.tile = userConsole.getLocationTile('SOURCE');
    this.target.tile = userConsole.getLocationTile('TARGET');   
    
    // Check if target is 'All Tiles')
    if (userConsole.targetTileIsAll()) {
        // Boolean flag indicated target tile is 'All Tiles')
        this.target.all = true;
    }
   
    // If target is an obstacle, move target to one of its neighbors
    if (this.target.tile.obstacle) {
        var neighbors = this.game.graph.getNeighbors(this.target.tile.id);
        var tileId = neighbors[0];
        this.target.tile = game.getTileFromId(tileId);
    } 
    
    // If "all tiles" is target tile
    if (this.target.all) {
        
        // Path mode not allowed, so cancel
        if (this.MODE === 'FOLLOW PATH') { return; }     
        
        // Update only source point marker
        this.pointmarker.source.tile = this.source.tile;
        
        // Show only source point marker
        userConsole.showPointMarker('SOURCE', true);
        userConsole.showPointMarker('TARGET', false);
        
    }
    else {
        
        // Update both point markers
        this.pointmarker.source.tile = this.source.tile;       
        this.pointmarker.target.tile = this.target.tile;
        
        // Show both point markers
        this.userConsole.showPointMarker('SOURCE', true);
        this.userConsole.showPointMarker('TARGET', true);
    }
    
    // Update Pathfinder with current mode
    this.MODE = mode;

    // Setup algorithm
    this.setupAlgorithm();

    // If in 'FOLLOW PATH' mode
    if (mode === 'FOLLOW PATH') {
        // Empty out directions list
        this.inputDirectionList = [];
        this.completeAlgorithm();
        this.constructPath();
        this.createInputDirectionList();
    }
    
    // If in 'FOLLOW MODE' and target was found
    if (mode === 'FOLLOW PATH' && this.found) {
        // Make the path exist
        this.layer.path.exists = true;
        
        // Show pathfinder layer
        this.userConsole.activatePathfinderLayerButton('PATH', true);
    }
    
    // If in 'FRONTIER' mode
    else if (mode === 'FRONTIER') {
        // Make the path exist
        this.layer.frontier.exists = true;
        
        // Show pathfinder layer
        this.userConsole.activatePathfinderLayerButton('FRONTIER', true);
    }
    

    // Move player to source tile
    game.setPlayerState('STILL');
    game.setPlayerTile(this.source.tile);
    
    // Make player face down
    game.setPlayerFacing('DOWN');
    
    // Press PLAY on VCR
    userConsole.setVCRCommand('PLAY');   
};


// Log results of algorithm to User Console
Pathfinder.prototype.logResults = function() {
    
    // If results have not been printed
    if (!this.results.printed) {
        
        // Send results to User Console
        this.game.logToUserConsole("<span class='success'>Target was successfully found!</span>");
        this.game.logToUserConsole("Total Length of Path: <span class='results'>" + this.results.length + ' tiles!</span>');
        this.game.logToUserConsole("Total Weight: <span class='results'>" + this.results.weight + "!</span>");
        
        // Indicate that results have been printed
        this.results.printed = true;
        
    }
};


// Get displacement of tileA to tileB
Pathfinder.prototype.getDisplacement = function(tileA, tileB) {
    
    var displacement = {
        row: 0,
        col: 0
    };
    
    // Determine displacement from startTile to stopTile
    displacement.row = tileA.row - tileB.row;
    displacement.col = tileA.col - tileB.col;
    
    return displacement;
};
 
//////////////////////////////////////////
//**************************************//
// Frontier Mode Methods
//**************************************//
//////////////////////////////////////////


Pathfinder.prototype._________FRONTIER_MODE_METHODS_________ = function() {};

Pathfinder.prototype.updateFrontierMode = function() {

    var game = this.game;

    // If algorithm has not finished running
    if (!this.complete) {

        // Step through algorithm
        this.stepAlgorithm();
        
        var open = this.deltaFrontier.open;
        var closed = this.deltaFrontier.closed;
               
        // Draw open set arrows
        for (let t of open) {
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'OPEN');
        }

        // Draw closed set
        for (let t of closed) {
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'CLOSED');
        }   
    }
   
    // If algorithm has finished running
    else if (this.complete && this.found) {        
        
        // Log results to User Console
        // Will log if they haven't printed already
        this.logResults();
        
        // Loop through path array
        let i = this.index;
        if (i < this.path.length) { 
            
            // Draw path arrows on Frontier layer
            let t = this.path[i];
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'PATH');
            this.index++;
            return;
        }

        // Turn Pathfinder off
        this.MODE = 'OFF';
        return;
    }
    // If algorithm finished running, but target wasn't found (all tiles)
    else {
        
        // Turn pathfinder off
        this.MODE = 'OFF';
        return;
    }  
};

// Draw an arrow to the Frontier layer
Pathfinder.prototype.drawArrow = function(tile, type) {
    
    // Skip source 
    // and skip target tile if not in 'All Tiles' mode
    if (tile.id === this.source.tile.id ||
            (tile.id === this.target.tile.id && !this.target.all)) {
        return;
    }
    
    var game = this.game;
    
    // Get row, col, id and floor of tile
    var row = tile.row;
    var col = tile.col;  
    var id = tile.floor.id;
    var floor = this.floors[id];

    // Get x, y coordinates of arrow on layer
    var tile_size = floor.tile_size;
    var x = col * tile_size;
    var y = row * tile_size;

    // Get angle from parent
    var angle = this.getAngleFromParent(tile);

    // Rotate arrow canvas
    var arrow = this.arrow;
    
    // Save context, translate and rotate canvas
    arrow.ctx.save();
    arrow.ctx.translate( arrow.canvas.width/2, arrow.canvas.height/2 );
    arrow.ctx.rotate( angle );

    // Draw arrow on arrow canvas
    var arrow_size = arrow.canvas.width;
    var top = {
        x: arrow_size / 2,
        y: arrow_size / 4
    };
    
    var left = {
        x: arrow_size / 4,
        y: (3/4) * arrow_size
    };
    
    var right = {
        x: (3/4) * arrow_size,
        y: (3/4) * arrow_size
    };

    
    // Get the shade of arrow based on (normalized) cost from source
    var cost = this.cost;
    let percent = cost[tile.id] / this.maxCost;
    var color = '';
    
    // If arrow belongst to closed set
    if (type === 'CLOSED') {

        // Get rgba values of starting and stopping colors
        this.rgbaFrom = game.hexToRgba(this.hexFrom, this.alpha);
        this.rgbaTo = game.hexToRgba(this.hexTo, this.alpha);
        
        // Compute middle value representing distance/weight
        let rgba = game.interpolateColor(this.rgbaFrom, this.rgbaTo, this.alpha, percent);
        color = rgba;
    } 
    // If arrow belongs to open set
    else if (type === 'OPEN') {
        
        // Compute rgba value of color of open set arrows
        this.rgbaOpen = game.hexToRgba(this.hexOpen, 1);
        let rgba = game.rgbaToString(this.rgbaOpen);
        color = rgba;
    }
    // If arrow is on path
    else if (type === 'PATH') {
        color = this.hexPath;
    }

    // Draw arrow and revert ctx to original state
    arrow.ctx.translate( -arrow.canvas.width/2, -arrow.canvas.height/2 );
    arrow.ctx.clearRect(0, 0, arrow_size, arrow_size);
    arrow.ctx.fillStyle = color;
    arrow.ctx.beginPath();
    arrow.ctx.moveTo(top.x, top.y);
    arrow.ctx.lineTo(left.x, left.y);
    arrow.ctx.lineTo(right.x, right.y);
    arrow.ctx.fill();
    arrow.ctx.restore();

    // Get layer
    var layer;
    if (tile.dof === 'BACKGROUND') {
        layer = floor.frontierlayer.background;
    }
    else if (tile.dof === 'FOREGROUND') {
        layer = floor.frontierlayer.foreground;
    }
    
    // Draw arrow to layer
    layer.ctx.clearRect(x, y, tile_size, tile_size);
    layer.ctx.drawImage(arrow.canvas, x, y, tile_size, tile_size);
};


// Get angle of tile in relation to parent
Pathfinder.prototype.getAngleFromParent = function(tile) {

    var game = this.game;


    var displacement = {
        row: 0,
        col: 0
    };


    var parent = this.parent;
    var tileId = tile.id;
    
    // If tile does not have a parent pointer, arrow faces down
    if (!parent[tileId]) {
        displacement.row = -1;
    }
    // Otherwise
    else {
        
        // Get parent tile
        let parentTile = game.getTileFromId(parent[tileId]);
        
        // Determine displacement from startTile to stopTile
        displacement.row = parentTile.row - tile.row;
        displacement.col = parentTile.col - tile.col;
    }


    // Use displacement to determine rotation
    var angle;  
    if (displacement.row === -1) {
        // Arrow faces up
        angle = 0;
    }
    else if (displacement.row === +1) {
        // Arrow faces down
        angle = Math.PI;
    }
    else if (displacement.col === -1) {
        // Arrow faces left
        angle = (3/2) * Math.PI;  
    }
    else if (displacement.col === +1) {
        // Arrow faces right
        angle = (1/2) * Math.PI;
    }

    return angle;
};


// Draw Frontier layer to screen
Pathfinder.prototype.drawFrontier = function(floorId, dof) {

    var userConsole = this.userConsole;    
    var game = this.game;
    
    // If Frontier layer is visible
    if (userConsole.isPathfinderLayerVisible('FRONTIER')) {
        
        // Get appropriate layer
        let layer;
        if (dof === 'BACKGROUND') {
            layer = this.floors[floorId].frontierlayer.background;
        }
        else if (dof === 'FOREGROUND') {
            layer = this.floors[floorId].frontierlayer.foreground;
        }
        
        // Draw layer to screen
        let options = {
            image: layer.canvas,
            target: 'floor', 
            floorId: floorId,
            dof: dof
        };       
        game.drawImageToScreen(options);      
    }
};


//////////////////////////////////////////
//**************************************//
// Find Path Mode Methods
//**************************************//
//////////////////////////////////////////

Pathfinder.prototype._________FOLLOW_PATH_MODE_METHODS_________ = function() {};

// Update Pathfinder in 'FOLLOW PATH' mode
Pathfinder.prototype.updateFollowPathMode = function() {
    
    var userConsole = this.userConsole;
    
    // Player is already in the middle of moving
    // or Pathfinder has been cancelled, return
    if (this.game.getPlayerState() !== 'STILL' || this.MODE === 'OFF') {       
        return;
    }
    
    // The update player method will take care of following the path
    
    // Turn off the pathinder is input list is exhausted
    else if (this.inputDirectionList.length === 0) {
        this.MODE = 'OFF';
        userConsole.setDirection(null);
        return;
    } 
    
    // Otherwise, send direction of Input Direciton List to User Console
    userConsole.setDirection(this.inputDirectionList.shift());   
};


// Create full path
Pathfinder.prototype.constructPath = function() {
    
    var game = this.game;
    var path = this.path;
    
    // Loop through path
    for (let i = 0; i < this.path.length; i++) {   
        
        // Get tile in path
        let tile = game.getTileFromId(path[i]);
        
        // Get pathlayer associated with that tile
        let f = tile.floor.id;
        let pathFloor = this.floors[f];
        let tile_size = pathFloor.tile_size;
        
        var layer;
        if (tile.dof === 'FOREGROUND') {
            layer = pathFloor.pathlayer.foreground;
        }

        else if (tile.dof === 'BACKGROUND') {
            layer = pathFloor.pathlayer.background;
        }
        
        // Update ctx of layer
        layer.ctx.strokeStyle = this.hexPath;
        layer.ctx.fillStyle = this.hexPath;
        layer.ctx.lineWidth = tile_size / 8;
        
        // Get indices of neighbors in path
        let prev = i - 1;
        let next = i + 1;
        
        // If left index is in bounds
        if (prev >= 0) {
        
            // Get tile of previous node
            var prevTile = game.getTileFromId(path[prev]);    
            
            // Append path segment if neither tile is a ladder
            if (!tile.ladder || !prevTile.ladder) {              
                this.appendPathSegment(tile, prevTile, layer, tile_size);
            }
        }
        
        // If right index is in bounds
        if (next < path.length) {
            
            // Get tile of next node
            var nextTile = game.getTileFromId(path[next]); 
            
            // Append path segment if neither tile is a ladder
            if (!tile.ladder || !nextTile.ladder) {
                this.appendPathSegment(tile, nextTile, layer, tile_size);
            }         
        }  
    }
};

// Add line segment to path
Pathfinder.prototype.appendPathSegment = function(tile, neighbor, layer, tile_size) {

    /*
     * This function draws a line segment from 
     * center of tile to one of its edges
     */

    // Get displacement of tile from its neighbor
    var displacement = this.getDisplacement(neighbor, tile);
    
    // Get length of segment
    displacement.row = (1/2) * displacement.row * tile_size;
    displacement.col = (1/2) * displacement.col * tile_size;
    
    // Get coordinates of tile's center
    var x = (tile.col + .5) * tile_size;
    var y = (tile.row + .5) * tile_size;
    
    // Get coordinates of edge between tile and neighbor
    var x1 = x + displacement.col;
    var y1 = y + displacement.row;
    
    layer.ctx.beginPath();
    layer.ctx.moveTo(x, y);
    layer.ctx.lineTo(x1, y1);
    layer.ctx.stroke();
    
    // Draw circle at intersection
    var radius = tile_size/16;
    layer.ctx.moveTo(x, y);
    layer.ctx.arc(x, y, radius, 0, 2 * Math.PI);  
    layer.ctx.fill();
    
};


// Create list of directions player uses to follow path
Pathfinder.prototype.createInputDirectionList = function() {
    
    var path = this.path;
    var game = this.game;
    
    // Loop through path
    for (let i = 0; i < path.length - 1; i++) {
        
        // Get current tilea and next tile
        var startNode = path[i];
        var stopNode = path[i + 1];

        var startTile = game.getTileFromId(startNode);
        var stopTile = game.getTileFromId(stopNode);
        
        // Get displacement between tiles
        var displacement = this.getDisplacement(stopTile, startTile);

        // Define input based on dispalcment
        var input = 'UP';    
        // Use displacement to determine direction
        if (displacement.row === -1) {
            input = 'UP';
        }
        else if (displacement.row === +1) {
            input = 'DOWN';
        }
        else if (displacement.col === -1) {
            input = 'LEFT';
        }
        else if (displacement.col === +1) {
            input = 'RIGHT';
        }

        // Add input to list of directions
        this.inputDirectionList.push(input);
    }
};


// Draw Path layer
Pathfinder.prototype.drawPath = function(floorId, dof) {
 
    var game = this.game;
    var userConsole = this.userConsole;
    
    // If Path layer is visible
    if (userConsole.isPathfinderLayerVisible('PATH')) {
     
        // Get layer
        let layer;
        if (dof === 'BACKGROUND') {
            layer = this.floors[floorId].pathlayer.background;
        }
        else if (dof === 'FOREGROUND') {
            layer = this.floors[floorId].pathlayer.foreground;
        }
        
        let options = {
            target: 'floor', 
            image: layer.canvas,
            floorId: floorId,
            dof: dof
        };
        
        // Draw layer to screen
        game.drawImageToScreen(options);       
    }
};

//////////////////////////////////////////
//**************************************//
// PointMarker Methods
//**************************************//
//////////////////////////////////////////

Pathfinder.prototype._________POINTMARKER_METHODS_________ = function() {};


// Draw markers to screen
Pathfinder.prototype.drawMarkers = function() {
    
    var game = this.game;
    var userConsole = this.userConsole; 
    var pathfinderlayer = userConsole.getPathfinderLayer();
    
    // Do not draw markers on Gameboy unless Path or Frontier layers are active
    if (game.getView() === 'gameboy' &&
            !pathfinderlayer.path.show &&
            !pathfinderlayer.frontier.show) {
        return;
    }
    
    // If on mobile, don't show point markers during Place Mode
    var pointer = game.getMonitorPointer();
    var mobile = pointer && pointer.action === 'TOUCH';
    
    // If source PointMarker is visible
    if (userConsole.isPointMarkerVisible('SOURCE')) {
        
        // Don't draw the source during Place Mode on mobile devices
        let skip = this.MODE === 'PLACE SOURCE' && mobile;
        
        if (!skip) {
            
            let tile = this.pointmarker.source.tile;
            let floorId = tile.floor.id;
            let dof = tile.dof;
            let options = {
                image: this.pointmarker.source.canvas, 
                target: 'tile',
                floorId: floorId,
                dof: dof,
                tile: tile,
                span: 2
            };
            game.drawImageToScreen(options);   
            
        }       
    }
    
    // If target PointMarker is visibile
    if (userConsole.isPointMarkerVisible('TARGET')) {
        
        // Don't draw the source during Place Mode on mobile devices
        let skip = this.MODE === 'PLACE TARGET' && mobile;
        
        if (!skip) {          
            let tile = this.pointmarker.target.tile;
            let floorId = tile.floor.id;
            let dof = tile.dof;
            
            let options = {
                image: this.pointmarker.target.canvas, 
                target: 'tile',
                floorId: floorId,
                dof: dof,
                tile: tile,
                span: 2
            };
            game.drawImageToScreen(options); 
        }     
    }
};


//////////////////////////////////////////
//**************************************//
// Pathfinding Algorithm Methods
//**************************************//
//////////////////////////////////////////


Pathfinder.prototype._________PATHFINDING_ALGORITHMS_________ = function() {};


// Follow parent pointers to reconstruct path
Pathfinder.prototype.makePath = function(node) {
    
    var path = this.path;
    var parent = this.parent;
    var game = this.game;
    
    var i = 0;
    var prevNode = null;
    
    // While node is defined
    while (node) {
        
        var nTile = game.getTileFromId(node);
        
        // If tile is a ladder
        if (nTile.ladder) {
            
            // Handle Source Tile is a ladder
            if (!parent[node]) {
                
                // If path is greater than length 1 (source and target are not the same)
                if (i !== 0) {
                    
                    // Get tile of previous node
                    var prevTile = game.getTileFromId(prevNode);
                    
                    // If player used the ladder
                    if (prevTile.floor.id !== nTile.floor.id) {
                        
                        // Get other end
                        var otherEndTile = this.game.getTileOtherEndLadder(nTile);
                        var otherEnd = otherEndTile.id; 
                        
                        // Add that back into path
                        path.push(otherEnd);
                        
                        // Pick a random neighboring node
                        var neighbors = this.graph.getNeighbors(node);
                        var neigh = neighbors[0];
                        
                        // Add the ladder node and a random neighbor to path
                        // This will make player walk off ladder, walk back on, take ladder and complete path                 
                        path.push(node);
                        path.push(neigh);
                    }  
                }
            }
            
            // Handle any tile is a ladder
            else {
                
                // Get other end
                var otherEndTile = this.game.getTileOtherEndLadder(nTile);
                var otherEnd = otherEndTile.id; 
                
                // Add that back into path
                path.push(otherEnd);   
            }     
        }
       
        // Push node into path array
        path.push(node);
        
        // Increment weight of path
        this.results.weight += this.getWeight(node);
        
        // Store current node as previous node
        prevNode = node;
        
        // Aquire parent point
        node = parent[node];        
        i++;
    }   
    
    // Special case for when source and target are opposite ends of same ladder
    if (this.trip.addBackSource) {
        path.push(this.source.tile.id);
    }
     
    // Reverse path if in 'FOLLOW PATH' mode
    if (this.MODE === 'FOLLOW PATH') {
        path.reverse();
    } 
    
    // Store length of path in results object
    this.results.length += path.length;

    return path;  
};


// Setup various algorithms
Pathfinder.prototype.setupAlgorithm = function() {
    
    var game = this.game;
    var algorithm = this.algorithm;
    
    // Send message to User Console
    this.game.logToUserConsole('----------------------------');
    game.logToUserConsole('Running <span class="algorithm">' + this.algorithm.label + '</span> ...');
    
    
    // Declare data structures
    this.parent = {};
    this.q = [];
    this.path = [];
    this.frontier = [];
    this.visited = new Set();
    this.open = new Set();
    this.closed = new Set();    
    this.deltaFrontier = {
        open: [],
        closed: []
    };
    
    this.cost = {};
    this.path = [];
    this.index = 0;
    this.found = false;
    this.complete = false;
    this.length = 0;
    this.results = {
        length: 0,
        weight: 0,
        printed: false  
    };
    
    // Define source and target for this particular trip
    this.trip = {};
    this.trip.all = this.target.all;
    this.trip.step = 0;
    
    // Get source and tile from pathfinder
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    
    // Special cases for ladders
    
    // If both source and target are ladders
    if (this.source.tile.ladder && this.source.tile.ladder) {
        
        // Source and target are opposite ends of the same ladder
        if ((this.source.tile.ladderId === this.target.tile.ladderId) &&
                (this.source.tile.id !== this.target.tile.id)) {
            
            // Move source to one of its neighbors
            var neighbors = this.graph.getNeighbors(this.source.tile.id);
            source = neighbors[0];
            
            // Flag to add back source at end
            this.trip.addBackSource = true;
            
            // Replace target's value with source
            // Player will automatically move to other end, which is target
            target = this.source.tile.id;  
            
        } 
    }
    
    // If the target tile is a ladder, then the target tile is the other end of the ladder
    else if (this.target.tile.ladder) {
        var otherEndTile = this.game.getTileOtherEndLadder(this.target.tile);
        var otherEnd = otherEndTile.id;       
        var target = otherEnd;
    }
    
    // Store source and target in trip
    this.trip.source = source;
    this.trip.target = target;

    // Initiate selected algorithm
    if (algorithm.id === 0) {
        this.bfs_setup();
    }
    else if (algorithm.id === 1) {
        this.dfs_setup();
    }
    else if (algorithm.id === 2) {
        this.dijkstra_setup();
    }
    else if (algorithm.id === 3) {
        this.astar_setup();
    } 
};

// Run through algorithm fully
Pathfinder.prototype.completeAlgorithm = function() {
    
    var algorithm = this.algorithm;
    
    // Step through algorithm until complete
    while(!this.complete) {
        this.stepAlgorithm();        
    }
    
    // If target was found
    if (this.found) {       
        // Send message to User Console
        this.logResults();        
    }

};

// Step through selected algorithm
Pathfinder.prototype.stepAlgorithm = function() {
    
    var algorithm = this.algorithm;
    
    if (algorithm.id === 0) {
        this.bfs_step();
    }
    else if (algorithm.id === 1) {
        this.dfs_step();
    }
    else if (algorithm.id === 2) {
        this.dijkstra_step();
    }
    else if (algorithm.id === 3) {
        this.astar_step();
    }
     
};


// Get edge weight associated with a specific tile
Pathfinder.prototype.getWeight = function(node) {
    
    var game = this.game;
    var weights = this.game.getEdgeWeights();
    
    let tile = game.getTileFromId(node);
    
    if (tile.type === 'WATER') {
        return weights.water;
    }
    else if (tile.dof === 'BACKGROUND') {
        return weights.background;
    }
    else if (tile.dof === 'FOREGROUND') {
        return weights.foreground;
    }
    
};

// Compute distance heuristic used for A*
Pathfinder.prototype.heuristic = function(vNode, uNode) {
    
    var game = this.game;
    
    // Get euclidean distance between tiles while ignoring floor
    var vTile = game.getTileFromId(vNode);
    var uTile = game.getTileFromId(uNode);
    
    // ∆row, ∆col
    var delta_row = vTile.row - uTile.row;
    var delta_col = vTile.col - uTile.col;
    
    // ∆row^2 + ∆col^2
    var row2 = Math.pow(delta_row, 2);
    var col2 = Math.pow(delta_col, 2);
    
    // Get distance with square root
    var distance = Math.pow(row2 + col2, .5);
    
    return distance;
    
};


// Return neighbors of a tile
/* Ladders must be handled differently from other tiles.
 * A ladder's neighbors should be the neighbors of the other end of the ladder.
 * This effectively creates temporary 'edges' between a ladder and the tiles sourrounding
 * the other end, but NOT the other end of the ladder directly.
 * This replicates the behavior of the character in the game, who automatically
 * takes any ladder he enters.
 */
Pathfinder.prototype.getNeighbors = function(vNode) {
    
    var neighbors;
    var vTile = this.game.getTileFromId(vNode);
    
    if (!vTile.ladder) {
        
        // Get your normal neighbors
        neighbors = this.graph.getNeighbors(vNode);
        
    }
    else {

        // Get other end
        var otherEndTile = this.game.getTileOtherEndLadder(vTile);
        var otherEnd = otherEndTile.id;
        
        // Get neighbors of the other end of ladder
        neighbors = this.graph.getNeighbors(otherEnd);
        
        // If you are starting at a ladder
        if (this.trip.step === 0)  {
            
            // Consider both regular neighbors in addition to other end's neighbors
            var regularNeighbors = this.graph.getNeighbors(vNode);
            neighbors = regularNeighbors.concat(neighbors); 
            neighbors = neighbors.slice();
            
            // But remove other end of ladder from neighbor list
            var index = neighbors.indexOf(otherEnd);
            neighbors.splice(index, 1);
        }
    }
    
    return neighbors;
};


/*******************************************/
/*******    Breadth-first Search    ********/
/*******************************************/

Pathfinder.prototype._________BREADTH_FIRST_SEARCH_________ = function() {};

// Setup Breadth-First Serach
Pathfinder.prototype.bfs_setup = function() {

    var game = this.game;

    // Get the queue
    var q = this.q;

    // Frontier structures
    var cost = this.cost;

    // Compute max cost (used for visualization)
    this.maxCost = game.getMapMaxDistance();

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;

    // Setup algorithm
    parent[source] = null;
    cost[source] = 0;
    visited.add(source);
    q.push(source);

};

// Step through Breadth-First search
Pathfinder.prototype.bfs_step = function() {

    // Get queue
    var q = this.q;

    // Return if queue is empty
    if (q.length <= 0) { 
        this.complete = true;
        return; 
    }

    // Frontier structures
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    
    var source = this.trip.source;
    var target = this.trip.target;   
    var alltiles = this.trip.all;
    
    // Dequeue node
    var vNode = q.shift();
    
    // Add node to closed set
    deltaFrontier.closed.push(vNode);

    // If target is found, and not set to 'All Tiles'
    if (!alltiles && vNode === target) {
        
        // Create path array and update flags
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    // Get neighbors of node
    var neighbors = this.getNeighbors(vNode);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        let uNode = neigh;      
        
        // If neighbor has not been visited
        if (!visited.has(uNode)) {

            // Add to visited set
            visited.add(uNode);
            
            // Update parent pointer
            parent[uNode] = vNode;
            
            // Add to queue
            q.push(uNode);

            // Update frontier objects
            deltaFrontier.open.push(uNode);
            let c = cost[vNode];
            cost[uNode] = c + 1;
        }
         
    }
    
    // Increment step count for this trip
    this.trip.step += 1;
};


/*******************************************/
/********    Depth-first Search    *********/
/*******************************************/

Pathfinder.prototype._________DEPTH_FIRST_SEARCH_________ = function() {};

// Set up Depth-First Search
Pathfinder.prototype.dfs_setup = function() {
    
    // Stack for iterative implementation
    this.stack = [];
    var stack = this.stack;

    // Frontier structures
    var cost = this.cost;

    // Compute max cost (used for visualization)
    this.maxCost = this.game.getMapMaxDistance();

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;

    // Setup algorithm
    parent[source] = null;
    cost[source] = 0;
    stack.push(source);
    visited.add(source);
};


// Step through DFS
Pathfinder.prototype.dfs_step = function() {
    
    // Get the game
    var game = this.game;
    
    // Get the stack
    var stack = this.stack;

    // Return if queue is empty
    if (stack.length <= 0) { 
        this.complete = true;
        return; 
    }

    // Frontier structures
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;
    var alltiles = this.target.all;

    // Pop node from stack, add to closed set
    var vNode = stack.pop();
    deltaFrontier.closed.push(vNode);

    // If target is found, and not set to 'All Tiles'
    if (!alltiles && vNode === target) {
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    // Get neighbors of node
    var neighbors = this.getNeighbors(vNode);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        let uNode = neigh;
        
        if (!visited.has(uNode)) {
            
            // Prepare algorithm for next iteration
            visited.add(uNode);
            parent[uNode] = vNode;
            stack.push(uNode);
 
            // Update frontier structures
            deltaFrontier.open.push(uNode);
            let c = cost[vNode];
            cost[uNode] = c + 1;
        }
    } 
    
    // Increment step count for this trip
    this.trip.step += 1;
};


/*******************************************/
/************    Dijkstra's    *************/
/*******************************************/

Pathfinder.prototype._________DIJKSTRAS_________ = function() {};


// Setup Dijkstra's
Pathfinder.prototype.dijkstra_setup = function() {
    
    // Create new priority queue
    this.pq = new PriorityQueue();
    var pq = this.pq;   

    // Frontier structures
    var cost = this.cost;
    
    // Max cost used for color interpolation in visualization
    // Increased by an arbitrary cosntant to account for weights
    this.maxCost = this.game.getMapMaxDistance() * 10;

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;
    var alltiles = this.target.all;

    // Setup algorithm
    parent[source] = null;
    
    // Set the distance_to cost of all nodes to be infinity
    // Set parent nodes of all nodes to null
    for (let node in this.graph.getNodes()) {
        cost[node] = Number.POSITIVE_INFINITY;
        parent[node] = null;
    }
    
    cost[source] = 0;
    pq.insert([source, 0]);
    visited.add(source);    
};

// Step through Dijkstra's
Pathfinder.prototype.dijkstra_step = function() {

    // Get priority queue
    var pq = this.pq;
    
    // Frontier structures
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;
    var alltiles = this.target.all;
    
    // Return if queue is empty
    if (pq.getSize() <= 0) { 
        this.complete = true;
        return; 
    }  
    
    // Delete min from pq, add to closed set
    var vNode = pq.deleteMin()[0];
    deltaFrontier.closed.push(vNode);
   
    // If node is target and not set to 'All Tiles'
    if (!alltiles && vNode === target) {
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    // Get neighbors of node
    var neighbors = this.getNeighbors(vNode);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        let uNode = neigh;
        let weight = this.getWeight(uNode); 
        
        // Relax edge as necessary
        let relax = cost[vNode] + weight;
        if (relax < cost[uNode]) {
            cost[uNode] = relax;
            parent[uNode] = vNode;
            pq.insert([uNode, relax]);
            
            // Update frontier structures
            deltaFrontier.open.push(uNode);
        }         
    }  
    
    // Increment step count for this trip
    this.trip.step += 1;
};


/*******************************************/
/************    A* Search    **************/
/*******************************************/

Pathfinder.prototype._________A_STAR_________ = function() {};

// Setup A*
Pathfinder.prototype.astar_setup = function() {
      
    // Create new priority queue
    this.pq = new PriorityQueue();
    var pq = this.pq;

    // Max cost used for color interpolation in visualization
    // Increased by an arbitrary cosntant to account for weights
    this.maxCost = this.game.getMapMaxDistance() * 10;

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;
    var alltiles = this.target.all;
    
    // Cannot run A* is destination is all tiles
    if (alltiles) {
        return;
    }
    
    // Setup algorithm
    
    // Define fCost, gCost arrays
    this.fCost = [];
    this.gCost = [];
    this.cost = this.fCost;
    
    var fCost = this.fCost;
    var gCost = this.gCost;

    // Update parent points and gCost for each node
    parent[source] = null;
    for (let node in this.graph.getNodes()) {
        gCost[node] = Number.POSITIVE_INFINITY;
        parent[node] = null;
    }
    
    gCost[source] = 0;
    fCost[source] = 0;
    pq.insert([source, fCost[source]]);
    visited.add(source);    
};

// Step through A*
Pathfinder.prototype.astar_step = function() {

    // Get pq
    var pq = this.pq;
    
    // Frontier structures 
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.trip.source;
    var target = this.trip.target;    
    var fCost = this.fCost;
    var gCost = this.gCost;
    
    // Return if queue is empty
    if (pq.getSize() <= 0) { 
        this.complete = true;
        return; 
    }  
    
    // Remove min from priority queue
    var vNode = pq.deleteMin()[0];
    deltaFrontier.closed.push(vNode);
    
    // If target was found
    if (vNode === target) {
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    // Get neighbors of node
    var neighbors = this.getNeighbors(vNode);
    
    // Loop through neighbors
    for (let neigh of neighbors) {
        
        // Exevute algorithm
        let uNode = neigh;
        let weight = this.getWeight(uNode);     
        
        let relax = gCost[vNode] + weight;
        if (relax < gCost[uNode]) {
            
            parent[uNode] = vNode;
            gCost[uNode] = relax;
            
            var hCost = this.heuristic(uNode, source);
            
            fCost[uNode] = gCost[uNode] + hCost;
            
            pq.insert([uNode, fCost[uNode]]);
            deltaFrontier.open.push(uNode);
        }           
    }   
    
    // Increment step count for this trip
    this.trip.step += 1;
};
