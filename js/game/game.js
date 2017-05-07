var Game = function() {
    
    this.algorithm = null;
    this.FPS = 60;
    //this.state = 
    
    this.USER_INPUT = null;
    this.STATE = null;
    this.ticks = 0;
    
    this.GAME_STATE = 'NORMAL';
    
    
    this.hoverTile = {
        type: 'NORMAL',
        id: null
    };
    
    this.weight = {
        LAND: 1,
        WATER: 25
    };
    
    
    this.console = {
        algorithms: {
            selected: null,
        },
        locations: {
            source: null,
            target: null
        }
    };
    
    this.tile_size = 64;
    
};

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
    var monitor = new Monitor(this);
    this.monitor = monitor;
    
    
    // ------ Init gameboy ------
    var gameboy = new Gameboy(this);
    this.gameboy = gameboy;
    
    
    
    
};

Game.prototype.getWaterlayer = function() {
    
  return this.map.waterlayer;  
    
};


Game.prototype.initUserConsole = function() {
    this.userConsole = new UserConsole(this);  
    this.userConsole.init();
};


Game.prototype.initSpritesheet = function() {
    
    this.spritesheet = new SpriteSheet(spritesheet_data);
    this.spritesheet.initSprite();
    
};


Game.prototype.initPathfinder = function() {
    
    // Create new pathfinder
    this.pathfinder = new Pathfinder(this, this.userConsole, this.graph);
    
    // Initialize pathfinder
    this.pathfinder.init();
    
};




Game.prototype.initPlayer = function() {
    
    this.player = new Player(this);
    
    // Defne player's initial location
    var entrance = this.map.keyTiles[0].tile;
    this.player.setTile(entrance);
    
    // Create player's shape and sprite representations
    //this.player.initShape();
    //this.player.initSprite();
    
    
    
    
};


Game.prototype.initMap = function() {   
    
    // Create Floor object objects
    var F1 = new Floor(this, F1_data);    
    var F2 = new Floor(this, F2_data);
    var BF1 = new Floor(this, BF1_data)
    
    F1.init(this.graph);
    F2.init(this.graph);
    BF1.init(this.graph);
    
    
    //    // Add floor data
    //    F1.addFloorData();
    //    F2.addFloorData();
    //    BF1.addFloorData();
    
    // Create game map
    this.map = new Map(this, map_data);
    this.map.init([F1, F2, BF1], this.graph);
    
};


Game.prototype.initGraph = function() {
    
    // Create game graph
    this.graph = new Graph();
    
    // Add map to graph
    //this.map.addMapToGraph(this.graph);
    //console.log(Object.keys(this.graph.adj).length);
    
};

Game.prototype.initMonitor = function() {
    
  
    
};


Game.prototype.createCanvasCtx = function() {
  
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    //var canvas = document.getElementById(canvasId);
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    return {
        canvas: canvas,
        ctx: ctx
    };
    
};


Game.prototype.updateGame = function() {
    
    this.updatePathfinder();
    this.updatePlayer();  
    
    
    
};

Game.prototype.getPlayerDOF = function() {
    return this.player.tile.dof;
};

Game.prototype.setView = function(view) {
    this.view = view;
};

Game.prototype.getView = function() {
    return this.view;
};

Game.prototype.drawShapeToScreen = function(img, floorId, tile, color) {
    
    var view = this.getView();

    if (view === "monitor") {
        this.monitor.drawShapeToFrame(img, floorId, tile, color);
    } else if (view === "gameboy") {
        this.gameboy.drawShapeToScreen(img, floorId, tile, color);
    }
    
};


Game.prototype.drawImageToScreen = function(img, option, floorId, dof, tile, span=1, alpha=1) {
    
    var view = this.getView();
    
    if (view === "monitor") {
        this.monitor.drawImageToFrame(img, option, floorId, dof, tile, span, alpha);
    } else if (view === "gameboy") {
        let options = {};
        options.location = option;
        options.floorId = floorId;
        options.dof = dof;
        options.tile = tile;
        options.span = span;
        options.alpha = alpha;
        this.gameboy.drawImageToScreen(img, options);
    }
    
};

Game.prototype.prepareScreen = function(state) {
  
    var view = this.getView();
    
    if (view === "monitor") {
        this.monitor.prepareMonitor(state);
    } else if (view === "gameboy") {
        this.gameboy.prepareGameboy(state);
    }
    
    
};

Game.prototype.clearScreen = function() {
    
    // Clear screen
    var view = this.getView();
    if (view === 'monitor') {
        this.monitor.clearFrame();
    }
    else if (view === 'gameboy') {
        this.gameboy.clearScreen();
    }
    
};

Game.prototype.updateMap = function() {
    
    
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
    /////////////////////
    
     // Draw floor layer (if in graphic mode)
    map.drawFloorLayer(MAP_STATE);
    
    // Draw point markers
    pathfinder.drawMarkers();
    
    
    for (let f in floors) {
        
       
        
        // Draw background layers
        
        //pathfinder.drawObstacles(floor, 'BACKGROUND');
        pathfinder.drawFrontier(f, 'BACKGROUND');
        pathfinder.drawPath(f, 'BACKGROUND');

        //    // Draw foreground layers
        //    pathfinder.drawMarkers(floor, 'FOREGROUND');
        //    pathfinder.drawObstacles(floor, 'BACKGROUND');
        pathfinder.drawFrontier(f, 'FOREGROUND');
        pathfinder.drawPath(f, 'FOREGROUND');
        //player.drawPlayer(floor, 'FOREGROUND');
        //    
        //    // Draw weight layers
        
        userConsole.drawWeightLayers(f);

    }
    
    map.drawObstacles();
    pathfinder.drawDrag();
    player.drawPlayer();
    
    // Draw additional layers that belong to the monitor and gameboy
    this.drawScreenLayers();
    
};



Game.prototype.updateMapOld = function() {
    
    this.map.updateMapLayers();
    
    var floors = this.map.floors;
    var map = this.map;
    var pathfinder = this.pathfinder;
    var player = this.player;
    var pTile = this.getPlayerTile();
    
    //map.LAYER_STATE = 'GRAPHIC';
    
    if (map.STATE === 'BITMAP') {
        
        for (let f in floors) {
            let floor = floors[f];
            let frame = floor. frame;
            let pathfinderFloor = this.pathfinder.floors[f];
            
            frame.ctx.clearRect(0, 0, floor.width, floor.height);
            
            
            // ---- Draw Background ---- //
            
            // Draw floor layers
            //            console.time('drawWater');
            //floor.drawWaterLayer();
            //            console.timeEnd('drawWater');
            //floor.drawBackground();
            
            // Draw path markers (if on foreground);
            pathfinder.drawMarkers(floor, 'BACKGROUND');
            pathfinder.drawFrontier(floor, 'BACKGROUND');
            pathfinder.drawPath(floor, 'BACKGROUND');
            //pathfinder.drawObstacles(floor, 'BACKGROUND');
            
            // Draw player
            player.drawPlayer(floor, 'BACKGROUND');
            
            
            // ---- Draw Foreground ---- //
            
            // Draw floor layer
            //floor.drawForeground();
            
            // Draw path markers (if on foreground);
            pathfinder.drawMarkers(floor, 'FOREGROUND');
            pathfinder.drawFrontier(floor, 'FOREGROUND');
            pathfinder.drawPath(floor, 'FOREGROUND');
            //pathfinder.drawObstacles(floor, 'FOREGROUND');
            
            // Draw player
            player.drawPlayer(floor, 'FOREGROUND');
            
            this.userConsole.drawWeightLayers(floor);
            
        }
    } else if (this.map.STATE === 'GRAPHIC')  {
        
//        for (let f in floors) {
//            this.map.floors[f].drawFloorLayer();
//            
//        }
//        this.drawPlayer();
        
    }
    
    
    
    // Draw rows/cols
    
    // draw on monitor
    // if (map.ROWSCOLS_STATE === 'ON') {
    //     map.drawRowsCols();   
    // };
    
    // Draw Special Tiles
    // .ladder, .occuppied
    //this.drawSprite();
    //    
    //    if (this.pathfinder.LAYER_STATE === 'VISUALIZER') {
    //        //map.drawVisualizerLayer();
    //    }
    //    
    //    
    //    else if (this.pathfinder.LAYER_STATE === 'ROUTER') {
    //        //map.drawPathLayer();
    //    }
    
};



Game.prototype.drawScreenLayers = function() { 
    
    var view = this.getView();

    if (view === "monitor") {
        this.monitor.drawMonitor();
    } else if (view === "gameboy") {
        this.gameboy.drawGameboy();
    }
  
};



// Probs not needed
Game.prototype.renderGame = function(path) {
    
    if (path === "/monitor/") {
        this.monitor.drawMonitor();
    } else if (path === '/') {
        this.gameboy.drawGameboy();
    }
    
};

Game.prototype.drawShape = function(shape, tile, color) {
    
    var row = tile.row;
    var col = tile.col;  
    var floor = tile.floor;
    var frame = floor.frame;
    var tile_size = floor.tile_size;    
    var x = col * tile_size;
    var y = row * tile_size;
    
    if (shape.toUpperCase() === 'CIRCLE') {
        
        x += (1/2) * tile_size;
        y += (1/2) * tile_size;
        
        frame.ctx.fillStyle = '#FF5722';
        frame.ctx.beginPath();
        frame.ctx.arc(x, y, tile_size/3, 0, Math.PI * 2);
        frame.ctx.fill();
        frame.ctx.closePath();
    }
    
    if (shape.toUpperCase() === 'SQUARE') {
        //frame.ctx.beginPath();
        frame.ctx.strokeStyle = "rgba(233, 30, 99, .7)";
        frame.ctx.lineWidth = 10;
        frame.ctx.strokeRect(x, y, tile_size, tile_size);
    }
    
};



Game.prototype.getSprite = function(spriteOptions, color) {
    return this.spritesheet.getSprite(spriteOptions, color);
};


Game.prototype.drawSprite = function(spriteOptions, tile, layer='frame', color) {
    
    var sprite = this.getSprite(spriteOptions, color);
    var row = tile.row;
    var col = tile.col;     
    var floor = tile.floor;
    var frame = floor.frame; 
    var tile_size = floor.tile_size;
    var sprite_size = this.getSpriteSize();
    var x = col * tile_size - (.5 * tile_size);
    var y = row * tile_size - (.5 * tile_size);    
    
    if (layer === 'frame') {
        frame.ctx.drawImage(sprite.canvas, 0, 0, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);
        return;
    }
    
    if (layer === 'visualizer') {
        floor.visualizerlayer.ctx.drawImage(sprite.canvas, 
        0, 0, sprite_size, sprite_size, 
        x , y, tile_size * 2, tile_size * 2);
    }
};


Game.prototype.getSpriteSize = function() {
    return this.spritesheet.sprite_size;
};


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


Game.prototype.getMonitorPointer = function() {
    return this.monitor.pointer;
};


/*******************************************/
/**********    Player Methods    ***********/
/*******************************************/
Game.prototype.__________PLAYER_METHODS__________ = function() {};


Game.prototype.updatePlayer = function() {
    this.player.updatePlayer();
};

Game.prototype.drawPlayer = function() {
    this.player.drawPlayer();
};

Game.prototype.getPlayerDragSprite = function() {
    return this.player.dragSprite;
};

Game.prototype.getPlayerSprites = function() {
    return this.player.getPlayerSprites();
};


Game.prototype.startPlayerDrag = function($event) {
    this.player.startDrag($event);
};

Game.prototype.endPlayerDrag = function() {
    this.player.endDrag();
};


Game.prototype.setPlayerFacing = function(direction) {
    this.player.playerOptions.FACING = 'DOWN';
};

Game.prototype.getPlayerTopLeft = function() {
    
    var player = this.player;
    return this.getTileTopLeft(player.tile);
    
};

Game.prototype.getPlayerMoveState = function() {
    return this.player.MOVE_STATE;
};

Game.prototype.setPlayerMoveState = function(state) {
    this.player.MOVE_STATE = state;
};


Game.prototype.setPlayerTile = function(tile) {
    this.player.setTile(tile);
};

Game.prototype.getPlayerTile = function() {
    return this.player.tile;
};

Game.prototype.getPlayerCurrentTile = function() {
    return this.player.getCurrentTile();
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



//Game.prototype.drawMap = function() {
//    
//    var map = this.map;
//    
//    if (map.LAYER_STATE === 'BITMAP') {
//        
//        map.drawBitmapRockLayers();       
//        map.drawBitmapWaterLayers();    
//        map.drawBitmapFloorLayers();
//        this.drawPlayer();
//        if (this.player.tile.type === 'WATER') {
//            map.drawBitmapOverlayLayers();
//        }
//        
//    } else if (map.LAYER_STATE === 'GRAPHIC') {
//        map.drawGraphicLayers();
//    }
//    
//    // Draw rows/cols
//    if (map.ROWSCOLS_STATE === 'ON') {
//        map.drawRowsCols();   
//    };
//    
//    // Draw Special Tiles
//    // .ladder, .occuppied
//    //this.drawSprite();
//    
//    if (this.pathfinder.LAYER_STATE === 'VISUALIZER') {
//        map.drawVisualizerLayer();
//    }
//    
//    else if (this.pathfinder.LAYER_STATE === 'ROUTER') {
//        map.drawPathLayer();
//    }
//    
//};

Game.prototype.drawTransition = function() {
    if (this.player.MOVE_STATE === 'LADDER') {
        this.map.drawMapTransitionLayer();
    }
};

Game.prototype.getMapState = function() {
    return this.userConsole.getMapState();  
};



Game.prototype.toggleMapLayers = function(layer) {
    //this.map.LAYER_STATE = layer;
};




Game.prototype.toggleMapGrid = function(state) {
    this.map.layers.GRID = state;
};

Game.prototype.toggleMapPathfinderLayer = function(layer) {
    
    // If the layer is avaiable
    if (this.pathfinder.LAYER === layer) {
        
        this.map.layers.PATHFINDER = layer;
        //        // If layer is off, turn it on
        //        if (this.map.layers.PATHFINDER !== layer) {
        //            
        //        }
        return true;
    }
    
    this.map.layers.PATHFINDER = null;
    
};

Game.prototype.getMapPathfinderLayer = function() {

    return this.map.layers.PATHFINDER;
    
};

Game.prototype.logToUserConsole = function(text) {
    this.userConsole.log(text);
};


Game.prototype.__________TILE_METHODS__________ = function() {};


Game.prototype.getTile = function(floor, row, col) {
    return this.map.getTile(floor, row, col);
};




Game.prototype.getTileTopLeft = function(tile) {
    return this.map.getTileTopLeft(tile);    
};


Game.prototype.getMapEuclidDistance = function(tile1, tile2) {
    return this.map.getMapEuclidDistance(tile1, tile2);
};

Game.prototype.getMapMaxDistance = function() {
    return this.map.getMapMaxDistance();
};

Game.prototype.setGameState = function(state) {
    this.GAME_STATE = state;    
};

Game.prototype.getGameState = function() {
    return this.GAME_STATE;
};

Game.prototype.getTileFromMonitorPointer = function() {
    return this.monitor.getTileFromPointer();  
};


Game.prototype.getTileFromId = function(tileId) {
    return this.map.getTileFromId(tileId);
};


Game.prototype.getMapLayers = function() {
    return this.map.layers;
};


Game.prototype.drawHoverTile = function() {
    
    //console.log(this.validTile);
    var pathfinder = this.pathfinder;
    
    if (pathfinder.PATH_STATE === 'SELECT SOURCE/TARGET') {
        
        var tile = pathfinder.hoverTile.tile;
        
        if (!tile) { return; }
        
        pathfinder.flagOptions.EVENT = pathfinder.hoverTile.sourceTarget;
        this.drawSprite(pathfinder.flagOptions, tile);
        
        var floor = tile.floor;
        
        var row = tile.row;
        var col = tile.col;
        var floor = tile.floor;
        
        var x = col * floor.tile_size;
        var y = row * floor.tile_size;
        
        //floor.frame.ctx.strokeStyle = 'yellow';
        //floor.frame.ctx.strokeRect(x + floor.frame.offset_x, y + floor.frame.offset_y, floor.tile_size, floor.tile_size);   
        
    };
    
    
    
    //    if (this.hoverTile.type === 'SOURCE' || this.hoverTile.type === 'TARGET') {
    //        this.spritesheet.getSprite(flagOptions);
    //        floor.frame.ctx.drawImage(this.spritesheet.sprite.canvas, x + floor.frame.offset_x, y + floor.frame.offset_y, floor.tile_size, floor.tile_size)
    //    }
    
    
    
    
};


Game.prototype.setTransitionAlpha = function(alpha) {
    console.log(alpha);
    this.map.setMapTransitionLayerAlpha(alpha);
    
};


// Reset the pointer of the context on the path layer for this tile's floor
Game.prototype.resetPathPointer = function(tile) {
    
    //tile.floor.pathlayer.ctx.beginPath();
    
};










Game.prototype.getTileOtherEndLadder = function(endA) {
    return this.map.getTileOtherEndLadder(endA);
};


Game.prototype.__________PATHFINDER_METHODS__________ = function() {};
  
Game.prototype.setPathfinderSourceTarget = function(tile) {
    this.pathfinder.setSourceTarget(tile)
};



Game.prototype.startPathfinder = function(state, sourceTarget) {
    this.pathfinder.startPathfinder(state, sourceTarget);
};

Game.prototype.clearPathfinder = function() {
    this.pathfinder.clearPathfinder();
};

Game.prototype.updatePathfinder = function() {
    
    var pathfinder = this.pathfinder;
    pathfinder.updatePathfinder();
    
};

Game.prototype.appendPath = function(color) {
    this.map.appendPath(color, this.player);
};

Game.prototype.createPathfinderFloorLayers = function() {
    this.map.createPathfinderFloorLayers();     
};

Game.prototype.getPathfinderState = function() {
    return this.pathfinder.getState();
};

Game.prototype.setPathfinderState = function(state) {
    this.pathfinder.setState(state);
};

Game.prototype.setPathfinderHoverTile = function(tileId, type) {
    this.pathfinder.setHoverTile(null);
};

Game.prototype.getPathfinderSourceFlag = function() {
    return this.pathfinder.flagSource;
};

Game.prototype.getPathfinderTargetFlag = function() {
    return this.pathfinder.flagTarget;
};

Game.prototype.drawFlags = function() {
    
    this.pathfinder.drawFlags();
    
};

Game.prototype.getRandomTile = function() {
    
    var tileIds = Object.keys(this.graph.adj);
    var length = tileIds.length;
    
    var index = 0;
    var tile = this.getTileFromId(tileIds[index]);
    
    while (tile.type === 'ROCK') {
        
        index = Math.floor(length * Math.random());
        tile = this.getTileFromId(tileIds[index]);
        
    }
    
    // Make sure tile isn't Mewtwo
    // Make sure tile isn't ladder
    
    return tile;
    
};


Game.prototype.setPathfinderConsoleTile = function(consoleTile, sourceTarget) {
    this.pathfinder.setConsoleTile(consoleTile, sourceTarget);
};

Game.prototype.setPathfinderConsoleAlgorithm = function(algorithm) {
    this.pathfinder.setConsoleAlgorithm(algorithm);
};

Game.prototype.getKeyTile = function(id) {
    return this.map.keyTiles[id].tile;
};

Game.prototype.removeEdgesToNeighbors = function(tile) {
    
    var graph = this.graph;
    var r = tile.row;
    var c = tile.col;
    var neighbors = [];
    neighbors.push([r-1, c]);
    neighbors.push([r+1, c]);
    neighbors.push([r, c-1]);
    neighbors.push([r, c+1]);
    
    for (let neigh of neighbors) {
        let row = neigh[0];
        let col = neigh[1];
        
        let nTile = this.getTile(tile.floor, row, col);
        //let type_neigh = this.getTileType(row, col);
        
        if (nTile) {
            graph.removeEdge(tile.id, nTile.id);
            graph.removeEdge(nTile.id, tile.id);
        }
        //if (this.inBounds(row, col) && nTile.type !== "ROCK") {
        
        //}
    }     
    
};

Game.prototype.addEdgesToNeighbors = function(tile) {
    
    var graph = this.graph;
    
    var r = tile.row;
    var c = tile.col;
    var neighbors = [];
    neighbors.push([r-1, c]);
    neighbors.push([r+1, c]);
    neighbors.push([r, c-1]);
    neighbors.push([r, c+1]);
    
    for (let neigh of neighbors) {
        let row = neigh[0];
        let col = neigh[1];
        
        let nTile = this.getTile(tile.floor, row, col);
        //let type_neigh = this.getTileType(row, col);
        
        if (nTile && nTile.type !== "ROCK") {
            graph.addEdge(tile.id, nTile.id);
            graph.addEdge(nTile.id, tile.id);
        }
    } 
    
    
};

Game.prototype.drawSpecial = function() {
    
    //return;
    
    var map = this.map;
    
    if (0) {
        for (let k in map.keyTiles) {
            let keyTile = map.keyTiles[k];
            let tile = keyTile.tile;
            let floor = tile.floor;
            let frame = floor.frame;
            var tile_size = tile.floor.tile_size;
            var xy = this.getTileFrameXY(tile);
            
            frame.ctx.fillStyle = 'blue';
            frame.ctx.fillRect(xy.x, xy.y, tile_size, tile_size);
        };
        
        
        for (let l in map.ladders) {
            let ladder = map.ladders[l];
            
            for (let tile of ladder.tile) {
                let floor = tile.floor;
                let frame = floor.frame;
                var tile_size = tile.floor.tile_size;
                var xy = this.getTileFrameXY(tile);
                
                frame.ctx.fillStyle = 'pink';
                frame.ctx.fillRect(xy.x, xy.y, tile_size, tile_size);
            }
        };
        
        
        for (let g in map.gaps) {
            let gap = map.gaps[g];
            let tile = gap.tile;
            let floor = tile.floor;
            let frame = floor.frame;
            var tile_size = tile.floor.tile_size;
            var xy = this.getTileFrameXY(tile);
            
            frame.ctx.fillStyle = 'white';
            frame.ctx.fillRect(xy.x, xy.y, tile_size, tile_size);
        };
        
    }
    
    var spriteOptions = {
        TYPE: 'OBSTACLE',
        LABEL: 'MEWTWO'
    };
    
    for (let o in map.obstacles) {
        let obstacle = map.obstacles[o];
        let tile = obstacle.tile;
        let floor = tile.floor;
        let frame = floor.frame;
        var tile_size = tile.floor.tile_size;
        var xy = this.getTileFrameXY(tile); 
        
        if (obstacle.label === 'MEWTWO') {
            
            spriteOptions.LABEL = obstacle.label;
            var sprite = this.drawSprite(spriteOptions, tile);
            
            frame.ctx.fillStyle = 'red';
            //frame.ctx.fillRect(xy.x, xy.y, tile_size, tile_size);
            //frame.ctx.drawImage(sprite.canvas, xy.x, xy.y, tile_size, tile_size);
        }
    };
    
    
    
    
};

Game.prototype.getTileFrameXY = function(tile) {
    
    var floor = tile.floor;
    var frame = floor.frame;
    var tile_size = tile.floor.tile_size;
    
    var y = (tile.row + frame.offset_rows) * tile_size;
    var x = (tile.col + frame.offset_cols) * tile_size;
    
    return {
        x: x,
        y:y
    };
    
};

Game.prototype.setTransitionOpacity = function(opacity) {
    this.transitionOpacity = opacity;
};


Game.prototype.getTransitionOpacity = function() {
    return this.transitionOpacity;
};


Game.prototype.getTransitionLayer = function() {
    return this.map.transitionlayer;
};

// 
Game.prototype.drawTriangle = function(color, opacity) {
    
};

Game.prototype.drawCircle = function() {
    
};

Game.prototype.getWeight = function(TYPE) {
    return this.weight[TYPE];
};


Game.prototype.getFloors = function() {
    return this.map.getFloors();
};


Game.prototype.getKeypress = function() {
    
//    if (this.pathfinder.PATH_STATE === 'PATH') {
//        return this.pathfinder.keypressList.shift();
//    }
    
    return this.KEYPRESS;
};

Game.prototype.hasEdge = function(tile1, tile2) {
    return Boolean(this.graph.getEdge(tile1.id, tile2.id));
};

Game.prototype.setUserConsole = function(algorithm, source, target) {
    
    
    if (algorithm) {
        this.console.algorithms.selected = algorithm;
    }
    
    if (source) {
        this.console.locations.source = source;
    }
    
    if (target) {
        this.console.locations.target = target;
    }
    
};


Game.prototype.setUserConsoleSourceLocation = function(id) {
    this.userConsole.setSourceLocation(id);
};

Game.prototype.setUserConsoleTargetLocation = function(id) {
    this.userConsole.setTargetLocation(id);
};

//Game.prototype.userConsole = function() {
//  
//    
//    
//};

Game.prototype.getPathMarkerTile = function(sourceTarget) {
    
    if (sourceTarget === 'SOURCE') {
        return this.pathMarker.source.tile;
    }
    else if (sourceTarget === 'TARGET') {
        return this.pathMarker.target.tile;
    }
    
};

Game.prototype.getUserConsoleLocationTile = function(sourceTarget) {
    return this.userConsole.getLocationTile(sourceTarget);    
};

Game.prototype.handleVCRCommand = function(COMMAND) {
    this.pathfinder.handleVCRCommand(COMMAND);
};


Game.prototype.getPathfinderState = function() {
    return this.pathfinder.PATH_STATE;
};

Game.prototype.getPathfinderLayer = function() {
    return this.pathfinder.LAYER;
};

Game.prototype.getUserConsoleAlgorithm = function() {
    return this.userConsole.selectedAlgorithm;
};

Game.prototype.createBlankLayer = function(canvas) {
    
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

Game.prototype.rgbaToString = function(rgba) {
    
    return 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ',' + rgba.alpha + ')';
    
};


Game.prototype.interpolateColor = function(color1, color2, alpha, percent) {
    
    var resultRed = color1.red + percent * (color2.red - color1.red);
    var resultGreen = color1.green + percent * (color2.green - color1.green);
    var resultBlue = color1.blue + percent * (color2.blue - color1.blue);
    
    resultRed = Math.floor(resultRed);
    resultGreen = Math.floor(resultGreen);
    resultBlue = Math.floor(resultBlue);
    
    
    var rgba = 'rgba(' + resultRed + ', ' + resultGreen + ', ' + resultBlue + ',' + alpha + ')';
    
    return rgba;  
    //return { red: resultRed, green: resultGreen, blue: resultBlue };
    
};


Game.prototype.getEdgeWeights = function() {

return this.userConsole.edgeweight;

};

Game.prototype.getRocklayer = function() {
    
  return this.map.rocklayer;
    
    
};


Game.prototype.getTransitionLayer = function() {
  return this.map.transition;    
};

Game.prototype.getTicks = function() {
    return this.ticks;
};

Game.prototype.getPathMarkers = function() {
    return this.pathfinder.pathMarker;
};

Game.prototype.startPointMarkerDrag = function($event) {
    this.pathfinder.startDragMode($event);
};

Game.prototype.endPointMarkerDrag = function() {
    this.pathfinder.endDragMode();
};

Game.prototype.isGridVisible = function() {
    return this.userConsole.isGridVisible();
};

Game.prototype.getObstacle = function(id) {
    return this.map.obstacles.tiles[id].tile;    
};

Game.prototype.getTileSize = function() {
    return this.tile_size;
};

Game.prototype.hasPathfinderLayer = function(layer) {
    return this.pathfinder.hasLayer(layer);
};

Game.prototype.getPointMarkerTile = function(sourceTarget) {
  
    if (sourceTarget === 'SOURCE') {
        return this.pathfinder.pointmarker.source.tile;
    } else if (sourceTarget === 'TARGET') {
        return this.pathfinder.pointmarker.target.tile;
    }
    
};


Game.prototype.floorHasWater = function(floorId) {
    
    return this.map.floors[floorId].hasWater();
    
};

Game.prototype.getMonitorAnchors = function() {
    return this.monitor.anchors;
};