var Pathfinder = function(game, userConsole, graph) {
    
    this.game = game;
    this.graph = graph;
    this.userConsole = userConsole;
    

    this.floors = {};

    
    // Colors used for visualizer and pather
    
    this.hexPath = "#55ecff";
    this.hexFrom = "#FFFFFF";
    this.hexTo = "#E91E63";
    //this.hexTo =  "#7fffd4";
    //this.hexFrom = "#7fffd4";
    //this.hexTo = "#673ab7";
    this.alpha = 0.7;
    
    this.LAYER = null;
  
    //    this.hoverTile = {
    //        tile: null,
    //        sourceTarget: 'OFF'        
    //    };

    this.flagSource = {
        type: 'SOURCE',
        show: false,
        tile: null
    };
    
    this.flagTarget = {
        type: 'TARGET',
        show: false,
        tile: null
    };


    this.layer = {
        path: {
            exists: false
        },
        frontier: {
            exists: false
        }
    };
    
    this.PATH_STATE = 'OFF';
    
    this.data = null;
    this.augment= null;
    this.DATA = null;
    
    this.pointmarker = {};
    
    this.dragTile;
    
    
    this.source = {
        tile: null,
    };
    this.target = {
        tile: null,
        all: false
    };
    
    // Game level tile size
    this.tile_size = game.getTileSize();
    
    
};


Pathfinder.prototype.obstacles = function() {
  
    this.obstacles
    
    
};


Pathfinder.prototype.init = function() {
    
    this.source.tile = this.game.getPlayerTile();
    this.target.tile = this.game.map.keyTiles[1].tile;
    this.target.all = false;
    
    // If target is an obstacle, move target to one of its neighbors
    if (this.target.tile.obstacle) {
        var neighbors = this.game.graph.getAdj(this.target.tile.id);
        var tileId = neighbors[0].to();
        this.target.tile = this.game.getTileFromId(tileId);
    } 
    
    
    
    //    this.flagSource.tile = this.source;
    //    this.flagTarget.tile = this.target;
    //    
    //    this.flagSource.show = true;
    //    this.flagTarget.show = true;

    var canvasSize = {
        width: 100,
        height: 100
    };

    // Create reusable arrow canvas
    this.arrow = this.createBlankLayer(canvasSize);

    // Create reusable pointMarker canvases
    var source = this.createBlankLayer(canvasSize);
    var target = this.createBlankLayer(canvasSize);

    var pointmarker = {
        source: source,
        target: target
    };
    
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

    // Draw visual markers on pointMarker canvases
    this.createMarkers();
    
    
    // 
    this.createPathfinderFloorLayers();
    
    console.log(this.pathfinder);
    
};

Pathfinder.prototype.initSprite = function() {
    
    var spritesheet = new SpriteSheet(spritesheet_data);
    spritesheet.initCanvas('bw');
    this.spritesheet = spritesheet;
      
};

Pathfinder.prototype.getState = function() {
    return this.PATH_STATE;
};


Pathfinder.prototype.setState = function(state) {
    this.PATH_STATE = state;
};


Pathfinder.prototype.setHoverTile = function(tileId, type) {
    this.hoverTile.id = tileId;
    this.hoverTile.type = type || this.hoverTile.type;
};


Pathfinder.prototype.createBlankLayer = function(canvas) {

    // Create sprite layer
    var newCanvas = document.createElement('canvas');
    var newCtx = newCanvas.getContext('2d');

    newCtx.mozImageSmoothingEnabled = false;
    newCtx.webkitImageSmoothingEnabled = false;
    newCtx.msImageSmoothingEnabled = false;
    newCtx.imageSmoothingEnabled = false;
            
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
        
    //newCtx.fillStyle = 'transparent';
    //newCtx.fillRect(0, 0, frame.canvas.width, frame.canvas.height);

    newCanvas.id = Math.random() * 10;
    newCtx.id = newCanvas.id;

    var layer = {
        canvas: newCanvas,
        ctx: newCtx
    };

    return layer;

};



Pathfinder.prototype.createPathfinderFloorLayers = function() {
    
    var floors = {};
    this.floors = floors;
    var map = this.game.map;
    
    // Create a canvas object for each floor in the map
    for (let f in map.floors) {
        
        var floor = map.floors[f];
        var id = floor.id;
        var frame = floor.frame;
        
       
        
        let frameSize = {
            width: floor.cols * this.tile_size,
            height: floor.rows * this.tile_size
        };
       

        var frontierlayer = {
            background: this.createBlankLayer(frameSize),
            foreground: this.createBlankLayer(frameSize)
        };

        var pathlayer = {
            background: this.createBlankLayer(frameSize),
            foreground: this.createBlankLayer(frameSize) 
        };

        floors[id] = {};
        //floors[id].tile_size = floor.tile_size;
        floors[id].tile_size = this.tile_size;
        floors[id]['frontierlayer'] = frontierlayer;
        floors[id]['pathlayer'] = pathlayer;  
   
    }  
};


/**************************************/
/**********    Utilities    ***********/
/**************************************/


Pathfinder.prototype._________UTILITIES_________ = function() {};

Pathfinder.prototype.hasLayer = function(layer) {
  
    if (layer === 'PATH') {
        return this.layer.path.exists;
    } else if (layer === 'FRONTIER') {
        return this.layer.frontier.exists;
    }
    
};


/***********************************************/
/**********    Pathfinder Methods    ***********/
/***********************************************/


Pathfinder.prototype._________PATHFINDER_METHODS_________ = function() {};



Pathfinder.prototype.startPathfinder = function(state) {
    
    
    // Cannot switch from these states to SELECT state
    if (state === 'MARK SOURCE' ||
            state === 'MARK TARGET') {
    
        this.startMarkMode(state);
    
    }
    
    else if (state === 'FRONTIER' ||
            state === 'PATH') {
        this.startFrontierPather(state);
    }
    
};

Pathfinder.prototype.updatePathfinder = function() {
    
    var console = this.userConsole;
    
    if (this.PATH_STATE === 'MARK SOURCE' ||
            this.PATH_STATE === 'MARK TARGET') {
        this.updateMarkMode();
    }
    
    if (this.PATH_STATE === 'DRAG SOURCE' ||
            this.PATH_STATE === 'DRAG TARGET') {
        this.updateDragMode();
    }
    
    if (console.vcr.command === 'PLAY' ||
            console.vcr.command === 'STEP') {
        
        if (this.PATH_STATE === 'FRONTIER') {
            this.updateFrontier();
        } 
        
        else if (this.PATH_STATE === 'PATH') {
            this.updatePath();
        } 
        
        if (console.vcr.command === 'STEP') {
            console.vcr.command = 'PAUSE';
            return;
        }
        
    }
    
    if (console.vcr.command === 'PAUSE') {
        this.game.KEYPRESS = null;
        return;
    }  
    
};


Pathfinder.prototype.clearPathfinder = function() {
    
    var userConsole = this.userConsole;
    
    if (this.PATH_STATE === 'MARK SOURCE' ||
            this.PATH_STATE === 'MARK TARGET') {
        
        this.flagTarget.tile = this.target.tile;
        this.flagTarget.show = true;
        
        this.flagSource.tile = this.source.tile;
        this.flagSource.show = true;
        
    }
    
    var map = this.game.map;
    var floors = this.floors;

    // Create a canvas object for each floor in the map
    for (let f in floors) {

        let frontierlayer = floors[f].frontierlayer; 
        let pathlayer = floors[f].pathlayer; 

        let width = frontierlayer.background.canvas.width;
        let height = frontierlayer.background.canvas.height;

        frontierlayer.background.ctx.clearRect(0, 0, width, height);
        frontierlayer.foreground.ctx.clearRect(0, 0, width, height);

        pathlayer.background.ctx.clearRect(0, 0, width, height);
        pathlayer.foreground.ctx.clearRect(0, 0, width, height);
 
    }
   
    console.log('clear this up');
    this.PATH_STATE = 'OFF';
    
    this.target.all = false;
    
    // Remove both pathfinder layers
    this.layer.path.exists = false;
    this.layer.frontier.exists = false;
    
    userConsole.showPathfinderLayer('PATH', false);
    userConsole.showPathfinderLayer('FRONTIER', false);
    
    
    //this.game.toggleMapPathfinderLayer(null);
    //this.game.setPlayerMoveState("STILL");
    this.game.KEYPRESS = null;
    userConsole.setVCRCommand(null);
    
};


Pathfinder.prototype.startDragMode = function($event) {
    
    var game = this.game;
    var userConsole = this.userConsole;

    console.log('entering drag mode');

    if (game.getPlayerMoveState() === 'STILL' &&
            this.PATH_STATE === 'OFF') {
        
        game.setMonitorPointer($event);
        let pointerTile = game.getTileFromMonitorPointer();
        
        if (pointerTile.id === this.pointmarker.source.tile.id &&
                userConsole.isPointMarkerVisible('SOURCE')) {
            this.PATH_STATE = 'DRAG SOURCE';
            
            // Hide and disable point marker
            userConsole.showPointMarker('SOURCE', false);
            //userConsole.enablePointMarker('SOURCE', false);
            this.userConsole.log('DRAG TARGET MODE HAS BEGUN');
        }    
        
        else if (pointerTile.id === this.pointmarker.target.tile.id &&
                userConsole.isPointMarkerVisible('TARGET')) {
            this.PATH_STATE = 'DRAG TARGET';
            
            // Hide and disable point marker
            userConsole.showPointMarker('TARGET', false);
            //userConsole.enablePointMarker('TARGET', false);
            this.userConsole.log('DRAG TARGET MODE HAS BEGUN');
        }
    }
};


Pathfinder.prototype.updateDragMode = function($event) {
    
    var game = this.game;   
    var tile = game.getTileFromMonitorPointer();
 
    if (tile 
            && tile.type !== "ROCK"
            && !tile.obstacle) {       
        this.dragTile = tile;       
    }
    else {
        this.dragTile = null;
    }
    
};


Pathfinder.prototype.endDragMode = function() {
    
    var userConsole = this.userConsole;
    
    if (this.PATH_STATE !== 'DRAG SOURCE' &&
            this.PATH_STATE !== 'DRAG TARGET' ) {
        console.log('NOT IT DRAG MODE');
        return;
    }
    
    
    
    if (this.PATH_STATE === 'DRAG SOURCE') {
        
        // If drag tile is valid
        if (this.dragTile) {
            // Move point marker to drag tile
            this.pointmarker.source.tile = this.dragTile;
            userConsole.setLocationTile('SOURCE', 4);
        }
        
        userConsole.enablePointMarker('SOURCE', true);
        userConsole.showPointMarker('SOURCE', true);
    }
    
    else if (this.PATH_STATE === 'DRAG TARGET') {
        
        if (this.dragTile) {
            this.pointmarker.target.tile = this.dragTile;           
            userConsole.setLocationTile('TARGET', 4);
        }
        
        userConsole.enablePointMarker('TARGET', true);
        userConsole.showPointMarker('TARGET', true);
    }    
    
    this.userConsole.log('DRAG MODE HAS ENDED');
    this.PATH_STATE = 'OFF';
    
};


Pathfinder.prototype.drawDrag = function() {
  
  var canvas = null;
  if (this.PATH_STATE === 'DRAG SOURCE') {
      canvas = this.pointmarker.source.canvas;
  }
  else if (this.PATH_STATE === 'DRAG TARGET') {
      canvas = this.pointmarker.target.canvas;
  }
  
  if (canvas && this.dragTile) {
      //this.game.drawShape('circle', this.dragTile);
      let dof = this.dragTile.dof;
      this.game.drawImageToScreen(canvas, 'tile', this.dragTile.floor.id, dof, this.dragTile, 2);
  }
    
};




Pathfinder.prototype.startMarkMode = function(state) {
    
    var userConsole = this.userConsole;
    
    // Cannot switch from these states to SELECT state    
    if (this.PATH_STATE === 'FRONTIER' ||
            this.PATH_STATE === 'PATH') { return; }
        
    
    // Just clicked 'MARK SOURCE'
    if (state === 'MARK SOURCE') {
        
        // Was already 'MARK SOURCE' --> 'MARK SOURCE' : deactivate
        if (this.PATH_STATE === 'MARK SOURCE') {
            
            // Revert to original value
            this.pointmarker.source.tile = this.source.tile;
            
            userConsole.showPointMarker('SOURCE', true);
//            userConsole.activatePointMarkerButton('SOURCE', true);
//            userConsole.disablePointMarkerCheckbox('SOURCE', true);
            
            this.PATH_STATE = 'OFF';
            return;  
            
        }
        
        // Was already 'MARK TARGET' --> 'MARK SOURCE' : switch
        if (this.PATH_STATE === 'MARK TARGET') {
            
            // If clicking while other SELECT is active, switch
            this.pointmarker.target.tile = this.target.tile;
            userConsole.showPointMarker('TARGET', true);

        }
        
        this.game.CLICKED = false;
        // Was 'OFF' or 'MARK TARGET' --> 'MARK SOURCE' : activate
        userConsole.showPointMarker('SOURCE', false);
        //userConsole.enablePointMarker('SOURCE', false);
        this.PATH_STATE = 'MARK SOURCE';
        return;
        
    }

    // Just clicked 'MARK TARGET'
    if (state === 'MARK TARGET') {
            
         // Was already 'MARK TARGET' --> 'MARK TARGET' : deactivate    
        if (this.PATH_STATE === 'MARK TARGET') {
            this.pointmarker.target.tile = this.target.tile;
            userConsole.showPointMarker('TARGET', true);
            this.PATH_STATE = 'OFF';
            return;
        } 
        
        // 'MARK SOURCE' --> 'MARK TARGET ' : switch
        if (this.PATH_STATE === 'MARK SOURCE') {        
            this.pointmarker.source.tile = this.source.tile;
            userConsole.showPointMarker('SOURCE', true);
        }
        
        // 'OFF' or 'MARK SOURCE' --> 'MARK TARGET' : activate
        userConsole.showPointMarker('TARGET', false);
        this.PATH_STATE = 'MARK TARGET';
        return;
        
    }
    
};



Pathfinder.prototype.updateMarkMode = function() {
    
    var game = this.game;
    var userConsole = this.userConsole;

    if (game.CLICKED) { 
        this.endMarkMode(); 
        return;
    };
    
    var tile = game.getTileFromMonitorPointer();
    
    // Get flag based on what you're selecting
    var marker = this.PATH_STATE === 'MARK SOURCE' ? this.pointmarker.source : this.pointmarker.target;
    var point = this.PATH_STATE === 'MARK SOURCE' ? 'SOURCE' : 'TARGET';

    // If pointer is over a valid tile
    if (tile 
            && tile.type !== 'ROCK'
            && !tile.obstacle) {
        console.log('I\'m over a valid tile');
        
        marker.tile = tile;
        marker.valid = true;
        userConsole.showPointMarker(point, true);
        
    } else {
        console.log("I'm not over a valid tile.");
        marker.valid = false;
        userConsole.showPointMarker(point, false);  
    }
   
};

Pathfinder.prototype.endMarkMode = function() {
    
    var game = this.game;
    var userConsole = this.userConsole;
    
    let marker;
    if (this.PATH_STATE === 'MARK SOURCE') {
        marker = this.pointmarker.source;
        if (marker.valid) {
            // Update source to marker
            this.source.tile = marker.tile;
            userConsole.showPointMarker('SOURCE', true);
            
            // Update source location to 'Current Marker' on User Cosole
            userConsole.setLocationTile('SOURCE', 4);
        }
        else {
            // Revert marker to its original location
            marker.tile = this.source.tile;
            userConsole.showPointMarker('SOURCE', true);
        }
    }
    else if (this.PATH_STATE === 'MARK TARGET') {
        marker = this.pointmarker.target;
        if (marker.valid) {
            // Update target to  marker
            this.target.tile = marker.tile;
            
            userConsole.showPointMarker('TARGET', true);
            
            // Update target location to 'Current Marker' on User Conole
            userConsole.setLocationTile('TARGET', 4);
        }
        else {
            marker.tile = this.target.tile;
            userConsole.showPointMarker('TARGET', true);
        }
    }
    
    this.PATH_STATE = 'OFF';
    game.CLICKED = false;
    return;   
    
};


Pathfinder.prototype.startFrontierPather = function(state) {
    
    var userConsole = this.userConsole;
     
    // Cannot switch SELECT states to Frontier or Pather   
    if (this.PATH_STATE === 'MARK SOURCE' ||
            this.PATH_STATE === 'MARK TARGET') { 
        
        this.endMarkMode();
        return; 
    
    }
   
   
    var game = this.game;
    var userConsole = this.game.userConsole;
    
    // Turn off pathfinder, if in progress
    this.clearPathfinder();
   
   // Get algorithm
    this.algorithm = userConsole.getSelectedAlgorithm();
    
    
    
    // Get source and target from console
    this.source.tile = userConsole.getLocationTile('SOURCE');
    this.target.tile = userConsole.getLocationTile('TARGET');
    //this.target = this.game.map.keyTiles[2].tile;
    
    
    // Check if target is 'All Tiles')
    if (userConsole.targetTileIsAll()) {
        
        // Boolean flag indicated target tile is 'All Tiles')
        this.target.all = true;
    }
   
    
    // If target is an obstacle, move target to one of its neighbors
    if (this.target.tile.obstacle) {
        var neighbors = this.game.graph.getAdj(this.target.tile.id);
        var tileId = neighbors[0].to();
        this.target.tile = game.getTileFromId(tileId);
    } 
    
    // If "all tiles" is target tile
    if (this.target.all) {
        
        // Path mode not allowed, so cancel
        if (this.PATH_STATE === 'PATH') { return; }     
        
        // Update only source point marker
        this.pointmarker.source.tile = this.source.tile;
        
        // Show only source point marker
        userConsole.showPointMarker('SOURCE', true);
        userConsole.showPointMarker('TARGET', false);
        
    }
    else {
        
        // Update point markers
        this.pointmarker.source.tile = this.source.tile;       
        this.pointmarker.target.tile = this.target.tile;
        
        this.userConsole.showPointMarker('SOURCE', true);
        this.userConsole.showPointMarker('TARGET', true);
    }
    
    
    
    
    

    // Declare data structures
    this.parent = {};
    this.q = [];
    this.path = [];
    this.frontier = [];
    this.visited = new Set();
    this.open = new Set();
    this.closed = new Set();
    this.found = false;
    this.deltaFrontier = {
        open: [],
        closed: []
    },
    
    this.cost = {};
    this.path = [];
    this.index = 0;
    this.complete = false;

    
    
    
    // Turn on pathfinder state
    

    
    
    //this.game.userConsole.activatePathFrontierButton(this.LAYER);
    //this.game.userConsole.togglePathFrontierLayers(this.LAYER, 'ON');
    this.PATH_STATE = state;

    // Setup algorithm
    this.setupAlgorithm();

    if (state === 'PATH') {
        this.completeAlgorithm();
        this.constructPath();
    }
    
    if (state === 'PATH' && this.found) {
        // Make the path exist
        this.layer.path.exists = true;
        
        // Show pathfinder layer
        this.userConsole.togglePathfinderLayerButton('click', 'PATH');
        //this.userConsole.showPathfinderLayer(state, true);
    }
    else if (state === 'FRONTIER') {
        // Make the path exist
        this.layer.frontier.exists = true;
        
        // Show pathfinder layer
        this.userConsole.togglePathfinderLayerButton('click', 'FRONTIER');
    }
    

    // Move player to source tile
    game.setPlayerMoveState('STILL');
    game.setPlayerTile(this.source.tile);
 
    
    // Make player face down
    game.setPlayerFacing('DOWN');
    
    // Press PLAY on VCR
    userConsole.vcr.command = 'PLAY';
    
};
 


Pathfinder.prototype.updateFrontier = function() {

    var game = this.game;

    if (!this.complete) {

        // Step through algorithm
       console.time('step algorithm');
        this.stepAlgorithm();
        console.timeEnd('step algorithm');

//        console.log('Open List: ')
//        console.log(this.deltaFrontier.open);
//
//        console.log('Closed List: ')
//        console.log(this.deltaFrontier.closed);

        var open = this.deltaFrontier.open;
        var closed = this.deltaFrontier.closed;
        
        console.time('draw arrows');
        // Draw open set
        for (let t of open) {
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'OPEN');
        }

        // Draw closed set
        for (let t of closed) {
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'CLOSED');
        }
        console.timeEnd('draw arrows');

    }

    else if (this.complete && this.found) {    
        
        let i = this.index;
        if (i < this.path.length) { 

            let t = this.path[i];
            let tile = game.getTileFromId(t);
            this.drawArrow(tile, 'PATH');
            this.index++;
            return;
        }

        this.PATH_STATE = 'OFF';
        return;
    }
    else {
        
        this.PATH_STATE = 'OFF';
        this.PLAY_STATE = 'OFF';
        return;
    }
    
};


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


Pathfinder.prototype.appendPathSegment = function(tile, neighbor, layer, tile_size) {

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

Pathfinder.prototype.constructPath = function() {
    
    var game = this.game;
    var path = this.path;
    
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
        
        layer.ctx.strokeStyle = this.hexPath;
        layer.ctx.fillStyle = this.hexPath;
        layer.ctx.lineWidth = tile_size / 8;
        
        // Get indices of neighbors in path
        let prev = i - 1;
        let next = i + 1;
        
        if (prev >= 0) {
        
            var prevTile = game.getTileFromId(path[prev]);    
            
            if (!tile.ladder || !prevTile.ladder) {
                
                this.appendPathSegment(tile, prevTile, layer, tile_size);
            }
            
            
            
        }
        
        if (next < path.length) {
            
            var nextTile = game.getTileFromId(path[next]); 
            
            if (!tile.ladder || !nextTile.ladder) {
                this.appendPathSegment(tile, nextTile, layer, tile_size);
            }
            
        }  
        
        // Draw circle at tile center
        //this.
        
    }
    
    game.userConsole.message.content = 'Path construction complete';
    
};



Pathfinder.prototype.appendPath = function() {

    
    var game = this.game;
    
    var pTile = game.getPlayerCurrentTile();
    var f = pTile.floor.id;
    
    var tile_size = this.floors[f].tile_size;
    var MOVE_STATE = game.getPlayerMoveState();
    
    var row = pTile.row;
    var col = pTile.col;
    
    
    
    //    // Adjust path during jump on/jump off
    //    if (MOVE_STATE === 'JUMP ON' || MOVE_STATE === 'JUMP OFF') {
    //        if (row < player.stopTile.row && player.playerOptions.FACING !== 'DOWN') {
    //            var y = player.stopTile.row * this.tile_size;
    //        }
    //    }
    
    var x = pTile.col * tile_size;
    var y = pTile.row * tile_size;
    
    x += tile_size / 2;
    y += tile_size / 2;        
    
    if (pTile.dof === 'FOREGROUND') {
        layer = this.floors[f].pathlayer.foreground;
    }
    
    else if (pTile.dof === 'BACKGROUND') {
        layer = this.floors[f].pathlayer.background;
    }
    
    //layer.ctx.beginPath();
    layer.ctx.strokeStyle = this.hexPath;
    layer.ctx.lineWidth = tile_size / 8;
    layer.ctx.lineTo(x, y);
    layer.ctx.stroke();
    
};





Pathfinder.prototype.updatePath = function() {
    
    //this.constructPath();
    this.simulateKeyPress();
    
//    if (this.LAYER === 'PATH') {
//        
//    }
//    
//    if (this.PATH_STATE !== 'OFF') {
//        //this.game.updatePlayer();
//        //this.appendPath();
//        
//    };
    
};





Pathfinder.prototype.setConsoleTile = function(consoleTile, sourceTarget) {
  
    this.console[sourceTarget].tile = consoleTile;
    
};

Pathfinder.prototype.setConsoleTileId = function() {
  
    console.log(this.console);
    
};
 
Pathfinder.prototype.getUserConsole = function() {
     

     
};
 
 
Pathfinder.prototype.getConsoleLocation = function(sourceTarget) {
     
    var game = this.game;
     
    var tile;
     
    var console = game.getUserConsole();
     
    var location;
    if (sourceTarget === 'SOURCE') {
        locaton = console.source;
    } else if (sourceTarget === 'TARGET') {
        location = console.target;
    }
     
     
    var console = this.console[sourceTarget];
     
    // If Console tile is Player Tile
    if (console.tile.id === 0) {
        tile = game.getPlayerTile();
    }
    // If console tile is Entrance
    else if (console.tile.id === 1) {
        var keyTileId = console.tile.keyTile;
        tile = game.getKeyTile(keyTileId);
    }  
    // If console tile is Mewtwo
    else if (console.tile.id === 2) {
        var keyTileId = console.tile.keyTile;
        tile = game.getKeyTile(keyTileId);   
    }
    else if (console.tile.id === 3) {
        tile = game.getRandomTile();       
    }
    else if (console.tile.id === 4) {
        if (sourceTarget === 'SOURCE') {
            tile = this.flagSource.tile;
        }
        else {
            tile = this.flagTarget.tile;
        }
    }
     
    return tile;
     
    
};



Pathfinder.prototype.setConsoleAlgorithm = function(algorithm) {
    
    this.console.algorithm = algorithm;
    
};



Pathfinder.prototype.runAlgorithm = function(state) {
     
//    var algorithm = this.console.algorithm;
//     
//    // Run BFS
//    if (algorithm.id === 0) {
//        this.bfs();
//    }
//    // Run DFS
//    else if (algorithm.id === 1) {
//        this.dfs();
//    }  
//    // Run Dijkstra's
//    else if (algorithm.id === 2) {
//        this.dijkstra();
//    }
//    // Run A*
//    else if (algorithm.id === 3) {
//        this.astar();   
//    }
//        
};

 
 


Pathfinder.prototype.createMarkers = function() {

    // Create source visual marker
    var marker = this.pointmarker.source;
    var marker_size = marker.canvas.width;

    marker.ctx.shadowBlur = marker_size;
    marker.ctx.shadowColor = "#00ff0b";
    marker.ctx.fillStyle = "rgba(109, 255, 115, .5)";
    marker.ctx.strokeStyle = "#4CAF50";

    marker.ctx.lineWidth = 4;

    marker.ctx.beginPath();
    marker.ctx.arc(marker_size/2, marker_size/2, marker_size/5, 0, 2*Math.PI);
    marker.ctx.fill();
    marker.ctx.stroke();



    // Create target visual marker
    marker = this.pointmarker.target;
    var marker_size = marker.canvas.width;


    marker.ctx.fillStyle = "rgba(0, 0, 0, .5)";

    var length = 12;
    var cube = marker_size/length;
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

    // Slice out the shape of a circle
    marker.ctx.globalCompositeOperation = 'destination-in';

    marker.ctx.fillRect((1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size);

    //    marker.ctx.fillStyle = "pink";
    //    marker.ctx.beginPath();
    //    marker.ctx.arc(marker_size/2, marker_size/2, marker_size/5, 0, 2*Math.PI);
    //    marker.ctx.fill();

    //Place white glow beneath circle
    marker.ctx.globalCompositeOperation = 'destination-over';

    marker.ctx.shadowBlur = marker_size;
    marker.ctx.shadowColor = "#FFFFFF";
    marker.ctx.fillStyle = "rgba(255, 255, 255, 1)";
    marker.ctx.strokeStyle = "rgba(255, 255, 255, .5)";
    
    marker.ctx.fillRect((1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size, (1/3) * marker_size);
    //marker.ctx.fillRect(marker_size/4, marker_size/4, marker_size/2, marker_size/2);

    //    marker.ctx.beginPath();
    //    marker.ctx.arc(marker_size/2, marker_size/2, marker_size/5, 0, 2*Math.PI);
    //    marker.ctx.lineWidth = 4;
    //    //marker.ctx.stroke();
    //    marker.ctx.fill();

    marker.ctx.globalCompositeOperation = 'source-over';

};


// Draw markers to frame
Pathfinder.prototype.drawMarkers = function() {
    
    var game = this.game;
    var userConsole = this.userConsole; 
    var pathfinderlayer = userConsole.getPathfinderLayer();
    
    if (game.getView() === 'gameboy' &&
            !pathfinderlayer.path.show &&
            !pathfinderlayer.frontier.show) {
        return;
    }
    
    if (userConsole.isPointMarkerVisible('SOURCE')) {
        
        let tile = this.pointmarker.source.tile;
        let floorId = tile.floor.id;
        let dof = tile.dof;
        game.drawImageToScreen(this.pointmarker.source.canvas, 'tile', floorId, dof, tile, 2);        
        
    }
    
    
    if (userConsole.isPointMarkerVisible('TARGET')) {
        
        let tile = this.pointmarker.target.tile;
        let floorId = tile.floor.id;
        let dof = tile.dof;
        game.drawImageToScreen(this.pointmarker.target.canvas, 'tile', floorId, dof, tile, 2);

    }

//    if (this.pointMarker.target.show) {
//        let tile = this.pointMarker.target.tile;
//
//        // If on current floor and DOF
//        if (tile.floor.id === floor.id && tile.dof === dof) {
//            floor.drawImageToFrame(this.pointMarker.target.canvas, tile, 2);
//        }
//
//    }

    // if (this.flagSource.show &&
    //         (game.getPlayerTile().id !== this.flagSource.tile.id)) {
        
    //     this.flagOptions.EVENT = 'SOURCE';
    //     this.drawSquare(tile, 'SOURCE');
    //     game.drawSprite(this.flagOptions, this.flagSource.tile);
        
    // };
    
    // if (this.flagTarget.show && 
    //         (game.getPlayerTile().id !== this.flagTarget.tile.id)) {
        
    //     this.flagOptions.EVENT = 'TARGET';
    //     game.drawSprite(this.flagOptions, this.flagTarget.tile);
    // }
    
};

Pathfinder.prototype.drawFrontier = function(floorId, dof) {

    var userConsole = this.userConsole;
    
    var game = this.game;
    var map = this.game.map;
    //var f = floor.id;

    //var activeLayers = game.getMapLayers();
    
    if (userConsole.isPathfinderLayerVisible('FRONTIER')) {
     
        let layer;
        if (dof === 'BACKGROUND') {
            layer = this.floors[floorId].frontierlayer.background;
        }
        else if (dof === 'FOREGROUND') {
            layer = this.floors[floorId].frontierlayer.foreground;
        }
        
        game.drawImageToScreen(layer.canvas, 'floor', floorId, dof);      
    }

};

Pathfinder.prototype.drawPath = function(floorId, dof) {
 
    var game = this.game;
    var userConsole = this.userConsole;
    
    //activeLayers.PATHFINDER
    if (userConsole.isPathfinderLayerVisible('PATH')) {
     
        let layer;
        if (dof === 'BACKGROUND') {
            layer = this.floors[floorId].pathlayer.background;
        }
        else if (dof === 'FOREGROUND') {
            layer = this.floors[floorId].pathlayer.foreground;
        }
        
        game.drawImageToScreen(layer.canvas, 'floor', floorId, dof); 
        
    }
 
    return;
};


Pathfinder.prototype._________FRONTIER_METHODS_________ = function() {};

Pathfinder.prototype.drawTests = function() {

    var test1 = document.getElementById('test1');
    var ctx = test1.getContext('2d');

    ctx.drawImage(this.floors['F1'].frontierlayer.background.canvas, 0, 0, test1.width, test1.height);

    var test2 = document.getElementById('test2');
    ctx = test2.getContext('2d');
    ctx.fillStyle = 'green';
    //ctx.fillRect(0, 0, test1.width, test1.height);
    ctx.drawImage(this.floors['F1'].frontierlayer.foreground.canvas, 0, 0, test1.width, test1.height);

};


Pathfinder.prototype.drawArrow = function(tile, type) {
    
    if (tile.id === this.source.tile.id ||
            tile.id === this.target.tile.id) {
        return;
    }
    
    var game = this.game;
    
    var row = tile.row;
    var col = tile.col;  
    var id = tile.floor.id;
    var floor = this.floors[id];

    //var frame = floor.frame;
    var tile_size = floor.tile_size;
    var x = col * tile_size;
    var y = row * tile_size;


    var angle = this.getAngleFromParent(tile);

    
    
    // Rotate arrow
    var arrow = this.arrow;

    var arrow_size = arrow.canvas.width;
    
    arrow.ctx.save();
    arrow.ctx.translate( arrow.canvas.width/2, arrow.canvas.height/2 );
    arrow.ctx.rotate( angle );

    // Draw arrow on arrow canvas
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
    
    var one_fourth = arrow_size/4;
    var one_half = arrow_size/2;

    
    // Get the shade based on (normalized) cost from source
    var cost = this.cost;
    let percent = cost[tile.id] / this.maxCost;
    
    //console.log(source.id, tile.id, percent);
    if (type === 'CLOSED') {

        this.rgbaFrom = game.hexToRgba(this.hexFrom, this.alpha);
        this.rgbaTo = game.hexToRgba(this.hexTo, this.alpha);
        

        let rgba = game.interpolateColor(this.rgbaFrom, this.rgbaTo, this.alpha, percent);
        color = rgba;
    } else if (type === 'OPEN') {
        this.hexOpen = "#FFC107"
        this.rgbaOpen = game.hexToRgba(this.hexOpen, 1);
        let rgba = game.rgbaToString(this.rgbaOpen);
        color = rgba;
    }

    else if (type === 'PATH') {
        color = this.hexPath;
    }

    arrow.ctx.translate( -arrow.canvas.width/2, -arrow.canvas.height/2 );
    arrow.ctx.clearRect(0, 0, arrow_size, arrow_size);
    arrow.ctx.fillStyle = color;
    arrow.ctx.beginPath();
    arrow.ctx.moveTo(top.x, top.y);
    arrow.ctx.lineTo(left.x, left.y);
    arrow.ctx.lineTo(right.x, right.y);
    arrow.ctx.fill();
    arrow.ctx.restore();

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


    //this.drawTests();
};





Pathfinder.prototype.getAngleFromParent = function(tile) {

    var game = this.game;


    var displacement = {
        row: 0,
        col: 0
    };


    var parent = this.parent;
    var tileId = tile.id;
    // If tile does not have a parent pointer, sprite faces down
    if (!parent[tileId]) {
        displacement.row = -1;
    }
    // Otherwise
    else {
        
        let parentTile = game.getTileFromId(parent[tileId]);
        
        // Determine displacement from startTile to stopTile
        displacement.row = parentTile.row - tile.row;
        displacement.col = parentTile.col - tile.col;

    }



    var angle;
    // Use displacement to determine rotation
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



Pathfinder.prototype.drawSpriteToFrontierLayer = function(tileId, interpolate) {
    
    // var game = this.game;
    // var tile = game.getTileFromId(tileId);
    // var floor = tile.floor;
    // var tile_size = floor.tile_size;
    // var visualizerlayer = floor.visualizerlayer;
    
    // // Get tile xy
    // var row = tile.row;
    // var col = tile.col;  
    // var tileXY = {};
    // tileXY.x = col * tile_size;
    // tileXY.y = row * tile_size;
    
    // var parent = this.parent;
    
    // If tile does not have a parent pointer, sprite faces down
    if (!parent[tileId]) {
        this.headOptions.FACING = 'DOWN';
    }
    // Otherwise
    else {
        
        let parentTile = game.getTileFromId(parent[tileId]);
        
        // Determine displacement from startTile to stopTile
        let displacement = {
            row: 0,
            col: 0
        };
        
        displacement.row = parentTile.row - tile.row;
        displacement.col = parentTile.col - tile.col;
        
        // Use displacement to determine direction
        if (displacement.row === -1) {
            this.headOptions.FACING = 'UP';
        }
        else if (displacement.row === +1) {
            this.headOptions.FACING = 'DOWN';
        }
        else if (displacement.col === -1) {
            this.headOptions.FACING = 'LEFT';
        }
        else if (displacement.col === +1) {
            this.headOptions.FACING = 'RIGHT';
        }
        
    }

    
    // // Set composite operation to normal and copy sprite from spritesheet to visualization layer
    // //visualizerlayer.ctx.globalCompositeOperation = 'source-over';
    
    // game.drawShape('triangle', 0, tile);
    // return;
    
    // this.headOptions.GENDER = game.getPlayerGender();
    // game.drawSprite(this.headOptions, tile, 'visualizer', false);
  
    
    
    
    // // Change composite operation so fill only applies to sprite
    // visualizerlayer.ctx.globalCompositeOperation = 'source-atop';
    // visualizerlayer.ctx.fillRect(tileXY.x, tileXY.y, tile_size, tile_size);
    
};

Pathfinder.prototype._________PATH_METHODS_________ = function() {};




Pathfinder.prototype.simulateKeyPress = function() {
    
    var game = this.game;
    if (game.getPlayerMoveState() !== 'STILL' || this.PATH_STATE === 'OFF') {
        // Player is already in the middle of moving
        // or Pathfinder has been cancelled, so return
        return;
    }
    
    var path = this.path;
    var index = this.index;
    var KEYPRESS = null;
    

    if (path.length <= 0 || (index + 1) >= path.length) {
        
        this.PATH_STATE = 'OFF';
        game.KEYPRESS = null;
        
        //this.game.setPlayerMoveState('STILL');
        console.log('all done!');
        return;
    }
    
    var startTile = path[index];
    var stopTile = path[index + 1];
    
    //    console.log(game.index);
    //    if (game.index === 129) {
    //        console.log('WAIT');
    //    }
    
    console.info(startTile, stopTile);
    
    startTile = game.getTileFromId(startTile);
    stopTile = game.getTileFromId(stopTile);
    
    if (game.getPlayerTile().id !== startTile.id) {
        let pTile = game.getPlayerTile().id;
        let sTile = startTile.id;
        console.error('Tile mismatch! Player Tile: ' + pTile + ' / Start Tile: ' + sTile);
    }
    
    // Determine displacement from startTile to stopTile
    var displacement = {
        row: 0,
        col: 0
    };
    
    displacement.row = stopTile.row - startTile.row;
    displacement.col = stopTile.col - startTile.col;
     
    var KEYPRESS = 'UP';    
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
    
    
    // Simulate KEYPRESS in game
    game.KEYPRESS = KEYPRESS;
    this.index += 1;
   
};


/***************************************************/
/**********    Pathfinding Algorithms    ***********/
/***************************************************/


Pathfinder.prototype._________PATHFINDING_ALGORITHMS_________ = function() {};


// Follow parent pointer to construct path
Pathfinder.prototype.makePath = function(node) {
    
    var path = this.path;
    var parent = this.parent;

    while (node) {
        if (this.PATH_STATE === 'PATH') {
            path.unshift(node);
        } else if (this.PATH_STATE === 'FRONTIER') {
            path.push(node);
        }
        
        node = parent[node];
    }   
    return path;
    
};


Pathfinder.prototype.setupAlgorithm = function() {
    
    var game = this.game;
    var algorithm = this.algorithm;
    
    this.game.logToUserConsole('----------------------------');
    game.logToUserConsole('Running ' + this.algorithm.label + '...');
    
    
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
    
    //this.dijkstra_setup();
    
    
    //userConsole.log('');

    

};


Pathfinder.prototype.completeAlgorithm = function() {
    
    var algorithm = this.algorithm;
    
    while(!this.complete) {
        this.stepAlgorithm();        
    }
    
    if (this.found) {
        this.game.logToUserConsole('Target was successfully found!');
        this.game.logToUserConsole('Total Length of Path: ' + this.path.length + ' tiles.')
        this.game.logToUserConsole('Total Weight: ');
    }
    
};


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


Pathfinder.prototype.getMapEuclidDistance = function(tile1, tile2) {

    var game = this.game;
    return game.getMapEuclidDistance(tile1, tile2);

};


/*******************************************/
/*******    Breadth-first Search    ********/
/*******************************************/


Pathfinder.prototype.bfs_setup = function() {

    var game = this.game;

    // The open set is the queue
    var q = this.q;

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;

    this.maxCost = game.getMapMaxDistance();

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;

    // Setup algorithm
    parent[source] = null;
    cost[source] = 0;
    visited.add(source);
    q.push(source);
    open.add(source);

};

Pathfinder.prototype.bfs_step = function() {

    // The open set is the queue
    var q = this.q;

    // Return if queue is empty
    if (q.length <= 0) { 
        console.log('Target not found');
        this.complete = true;
        return; 
    }

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    
    var alltiles = this.target.all;
    

    vNode = q.shift();
    closed.add(vNode);
    open.delete(vNode);
    deltaFrontier.closed.push(vNode);

    
    if (!alltiles && vNode === target) {
        console.log('Target found');
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
        //console.log(timeline);
        //return this.path;
    }
    
    for (let edge of this.graph.getAdj(vNode)) {
        
        let uNode = edge.to();
        
        if (!visited.has(uNode)) {
            
            visited.add(uNode);
            parent[uNode] = vNode;
            q.push(uNode);


            open.add(uNode);  
            deltaFrontier.open.push(uNode);
            //let c = this.getMapEuclidDistance(uNode, source);
            let c = cost[vNode];
            cost[uNode] = c + 1;
        }
    }
};


/*******************************************/
/********    Depth-first Search    *********/
/*******************************************/


Pathfinder.prototype.dfs_setup = function() {
    
    // Stack for iterative implementation
    this.stack = [];
    var stack = this.stack;

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;

    this.maxCost = 300;

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;

    // Setup algorithm
    parent[source] = null;
    cost[source] = 0;
    stack.push(source);
    visited.add(source);
    open.add(source);

};


Pathfinder.prototype.dfs_step = function() {
    
    // Get the game
    var game = this.game;
    
    // Get the stack
    var stack = this.stack;

    // Return if queue is empty
    if (stack.length <= 0) { 
        console.log('Target not found');
        this.complete = true;
        return; 
    }

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    var alltiles = this.target.all;

    var vNode = stack.pop();
    closed.add(vNode);
    open.delete(vNode);
    deltaFrontier.closed.push(vNode);

    
    if (!alltiles && vNode === target) {
        game.logToUserConsole('Target found!');
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    for (let edge of this.graph.getAdj(vNode)) {
        
        let uNode = edge.to();
        
        if (!visited.has(uNode)) {
            
            visited.add(uNode);
            parent[uNode] = vNode;
            stack.push(uNode);


            open.add(uNode);  
            deltaFrontier.open.push(uNode);
            //let c = this.getMapEuclidDistance(uNode, source);
            let c = cost[vNode];
            cost[uNode] = c + 1;
        }
    }
    
};


/*******************************************/
/************    Dijkstra's    *************/
/*******************************************/


Pathfinder.prototype.dijkstra_setup = function() {
    
    // Stack for iterative implementation
    this.pq = new BinaryHeap(function(x){return x[1];});
    var pq = this.pq;

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;

    this.maxCost = 300;

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    var alltiles = this.target.all;

    // Setup algorithm
    parent[source] = null;
    
    for (let node in this.graph.getNodes()) {
        cost[node] = Number.POSITIVE_INFINITY;
        parent[node] = null;
    }
    
    cost[source] = 0;
    pq.push([source, 0]);
    visited.add(source);
    open.add(source);
    
};


Pathfinder.prototype.dijkstra_step = function() {

    var pq = this.pq;
    
    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var cost = this.cost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;  
    var alltiles = this.target.all;
    
    this.game.logToUserConsole(pq.size());
    
    // Return if queue is empty
    if (pq.size() <= 0) { 
        console.log('Target not found');
        this.complete = true;
        return; 
    }  
    
    //console.time('pop node');
    var vNode = pq.pop()[0];
    closed.add(vNode);
    open.delete(vNode);
    deltaFrontier.closed.push(vNode);
    //console.timeEnd('pop node');
    
    if (!alltiles && vNode === target) {
        this.game.logToUserConsole('Target found!');
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    for (let edge of this.graph.getAdj(vNode)) {
        
        let uNode = edge.to();
        let weight = this.getWeight(uNode); 
        
        let relax = cost[vNode] + weight;
        if (relax < cost[uNode]) {
            cost[uNode] = relax;
            parent[uNode] = vNode;
            pq.push([uNode, relax]);
            
            open.add(uNode);  
            deltaFrontier.open.push(uNode);
        }         
    }    
    
};


/*******************************************/
/************    A* Search    **************/
/*******************************************/



Pathfinder.prototype.astar_setup = function() {
    
    // Stack for iterative implementation
    this.pq = new BinaryHeap(function(x){return x[1];});
    var pq = this.pq;

    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    this.fCost = [];
    this.gCost = [];
    this.cost = this.fCost;
    
    var fCost = this.fCost;
    var gCost = this.gCost;

    this.maxCost = 300;

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    var alltiles = this.target.all;
    
    // Cannot run A* is destination is all tiles
    if (alltiles) {
        return;
    }

    // Setup algorithm
    parent[source] = null;
    
    for (let node in this.graph.getNodes()) {
        gCost[node] = Number.POSITIVE_INFINITY;
        parent[node] = null;
    }
    
    gCost[source] = 0;
    fCost[source] = 0;
    pq.push([source, fCost[source]]);
    visited.add(source);
    open.add(source);
    
};


Pathfinder.prototype.astar_step = function() {

    var pq = this.pq;
    
    // Frontier structures
    var open = this.open;
    var closed = this.closed;
    var fCost = this.fCost;
    var gCost = this.gCost;
    var deltaFrontier = this.deltaFrontier;
    deltaFrontier.open = [];
    deltaFrontier.closed = [];

    // Pathfining structures
    var parent = this.parent;
    var visited = this.visited;
    var source = this.source.tile.id;
    var target = this.target.tile.id;   
    
    this.game.logToUserConsole(pq.size());
    
    // Return if queue is empty
    if (pq.size() <= 0) { 
        console.log('Target not found');
        this.complete = true;
        return; 
    }  
    
    //console.time('pop node');
    var vNode = pq.pop()[0];
    closed.add(vNode);
    open.delete(vNode);
    deltaFrontier.closed.push(vNode);
    //console.timeEnd('pop node');
    
    if (vNode === target) {
        this.game.logToUserConsole('Target found!');
        this.makePath(vNode);
        this.found = true;
        this.complete = true;
        return;
    }
    
    for (let edge of this.graph.getAdj(vNode)) {
        
        let uNode = edge.to();
        let weight = this.getWeight(uNode);     
        
        let relax = gCost[vNode] + weight;
        if (relax < gCost[uNode]) {
            
            parent[uNode] = vNode;
            gCost[uNode] = relax;
            
            var hCost = this.heuristic(uNode, source);
            
            fCost[uNode] = gCost[uNode] + hCost;
            
            pq.push([uNode, fCost[uNode]]);
            open.add(uNode);  
            deltaFrontier.open.push(uNode);
        }    
        
    }    
};


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

Pathfinder.prototype.heuristic = function(vNode, uNode) {
    
    var game = this.game;
    
    var vTile = game.getTileFromId(vNode);
    var uTile = game.getTileFromId(uNode);
    
    var delta_row = vTile.row - uTile.row;
    var delta_col = vTile.col - uTile.col;
    
    var row2 = Math.pow(delta_row, 2);
    var col2 = Math.pow(delta_col, 2);
    
    var distance = Math.pow(row2 + col2, .5);
    
    return distance;
    
};


/*******************************************/
/************       **************/
/*******************************************/





Pathfinder.prototype.dfs_helper = function(vNode, target, s) {
    
    var visited = this.visited;
    
    if (vNode === target) {
        console.log("Thanks DFS!");
        return true;
        //console.log(timeline);
        //return this.path;
    }
    
    if (this.graph.getAdj(vNode).length > 0) {
        this.stepbystep.push([]);
    }
    
    for (let edge of this.graph.getAdj(vNode)) {  
        
        let uNode = edge.to();    
        
        if (!visited.has(uNode)) {
            this.parent[uNode] = vNode;
            visited.add(uNode);
            this.stepbystep[s].push(uNode);
            if (this.dfs_helper(uNode, target, s+1)) {
                return true;
            }
        }
        
        //this.visited.delete(vNode);
        this.step += 1;
    }

};




Pathfinder.prototype.astar = function() {
  
    var pq = new BinaryHeap(function(x){return x[1];});
    //alert(pq);
    
    var game = this.game;
    var source = this.source.tile.id;
    var target = this.target.tile.id;
    var stepbystep = this.stepbystep;
    var parent = this.parent;
    var graph = this.graph;
    
    this.parent[source] = null;
    var distanceTo = [];
    
    for (let node in graph.getNodes()) {
        distanceTo[node] = Number.POSITIVE_INFINITY;
        parent[node] = null;
    }
    
    stepbystep.push([]);
    var step = 0;
    stepbystep[step].push(source);
    
    distanceTo[source] = 0;
    pq.push([source, 0]);
    
    while (pq.size() > 0) {
        
        var vNode = pq.pop()[0];
        var vTile = game.getTileFromId(vNode);
        
        stepbystep.push([]);
        stepbystep[step].push(vNode);
        
        if (vNode === target) {
            console.log('Thank You, Astar!');
            this.makePath(vNode, this.parent, this.path);
            return;
        }
        
        for (let edge of graph.getAdj(vNode)) {
            let uNode = edge.to();
            let relax = distanceTo[vNode] + edge.weight;
            if (relax < distanceTo[uNode]) {
                distanceTo[uNode] = relax;
                parent[uNode] = vNode;
                //                var uTile = game.getTileFromId(uNode);
                //                //uTile.floor = vTile.floor;
                //                var tile = {
                //                    row: uTile.row,
                //                    col: uTile.col, 
                //                    floor: vTile.floor
                //                }
                var hn = this.heuristic(uNode, target);
                console.log('Heuristic of ' +  uNode + ' and Target ' + target +  ' is : ' + hn);
                var fn = relax + hn;
                pq.push([uNode, fn]);
                
            }  
        }  
        step++;
    }    
    
};






Pathfinder.prototype.ladderCheck = function(vNode, uNode) {
  
    var game = this.game;
    var vTile = game.getTileFromId(vNode);
    
    // If current node is a tile
    if (vTile.ladder) {
        // Check whether its neighbor is on the same floor as parent
        var uTile = game.getTileFromId(uNode);
        var parent = this.parent[vNode];
        var pTile = game.getTileFromId(parent);
        
        // If ladder and neighbor are on the same floor
        if (pTile && (uTile.floor.id === pTile.floor.id)) {
            
            // Remove vNode from visited
            //this.visited.delete(vNode);
            
            return false;
        }
        else {
            return true;
        }
    }
    
    return true;
    
};

Pathfinder.prototype.handleVCRCommand = function(COMMAND) {
  
//    if (this.PATH_STATE !== 'PATH' &&
//            this.PATH_STATE !== 'FRONTIER') {
//        console.info("You much be generating a frontier or following a path to use the VCR");
//        return;
//    }
//    
//    var vcr = this.vcr;
//    
//    if (COMMAND === 'PLAY') {
//        vcr.COMMAND = 'PLAY';
//    }
//    
//    else if (COMMAND === 'PAUSE') {
//        vcr.COMMAND = 'PAUSE';
//    }
//    
//    else if (COMMAND === 'STEP') {
//        vcr.COMMAND = 'STEP';
//    }
//    
//    console.info(vcr);
    
};





//
//Pathfinder.prototype.initMewtwo = function() {
//    //    
//    //    var game = this.game;
//    //    var mewtwo = {};
//    //    
//        
//    //    
//    //    mewtwo.tile = this.game.getKeyTile(1); 
//    //    mewtwo.tile.occupied = true;
//    //    
//    //    game.removeEdgesToNeighbors(mewtwo.tile);
//    //    
//    //    this.mewtwo = mewtwo;
//    //    
//    //this.inaccessible.add(mewtwo.tile.id);
//    
//    
//    
//    //game.addOccipiedTileToGraph();        
//};
//
//
//Pathfinder.prototype.drawMewtwo = function() {
//    
//    this.game.drawSprite(this.mewtwo.spriteOptions, this.mewtwo.tile);  
//    
//};
