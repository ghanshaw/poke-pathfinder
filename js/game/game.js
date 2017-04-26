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
    
   
};

Game.prototype.initGame = function() {
    
    this.initSpritesheet();
    this.initMap();
    
    // ------ Init graph ------
    this.initGraph();
    
    
     // ------ Init player ------
    this.initPlayer();
    
    
    // ------ Init pathfinder ------
    this.initPathfinder();
    
    
    // ------ Init monitor ------
    var monitor = new Monitor(this);
    this.monitor = monitor;
       
    
    // ------ Init gameboy ------
    var gameboy = new Gameboy(this);
    this.gameboy = gameboy;

    
};


Game.prototype.initSpritesheet = function() {
    
    this.spritesheet = new SpriteSheet(spritesheet_data);
    this.spritesheet.initSprite();
    
};


Game.prototype.initPathfinder = function() {
  
    // Create new pathfinder
    this.pathfinder = new Pathfinder(this, this.graph);
    
    // Initialize pathfinder
    this.pathfinder.init();
    
    // Create sprite and add visualization to floors
    //this.pathfinder.initSprite();
    this.pathfinder.createPathfinderFloorLayers();
    
    console.log(this.pathfinder);
    
};


Game.prototype.initPlayer = function() {
    
    this.player = new Player();
    
    // Create player's shape and sprite representations
    this.player.initShape();
    this.player.initSprite();
    
    // Defne player's initial location
    var entrance = this.map.keyTiles[0].tile;
    this.player.setTile(entrance);
    
    // Expose game to player
    this.player.game = this;
    console.log(this.player);
  
};


Game.prototype.initMap = function() {
    
    
    
    // Create Floor object objects
    var F1 = new Floor(F1_data);    
    var F2 = new Floor(F2_data);
    var BF1 = new Floor(BF1_data)

    // Add floor data
    F1.addFloorData();
    F2.addFloorData();
    BF1.addFloorData();
    
    // Create game map
    this.map = new Map(map_data);
    
    // Expose game to map
    this.map.game = this;
    
    // Add floors to map
    this.map.addFloor(F1);
    this.map.addFloor(F2);
    this.map.addFloor(BF1);

    // Add map data to map
    this.map.addMapData();
    
    // Add ladders data to map
    //this.map.addLadders();
    
    // Create map layers
    this.map.createMapLayers();
    

};


Game.prototype.initGraph = function() {
 
    // Create game graph
    this.graph = new Graph();
    
    // Add map to graph
    this.map.addMapToGraph(this.graph);
    console.log(Object.keys(this.graph.adj).length);
    
};


Game.prototype.updateGame = function() {
    
    this.updatePathfinder();
    this.updatePlayer();  
    
    
    
};

Game.prototype.getPlayerDOF = function() {
    return this.player.tile.dof;
};

Game.prototype.updateMap = function() {
  
    var floors = this.map.floors;
    var map = this.map;
    var pathfinder = this.pathfinder;
    var player = this.player;
    var pTile = this.getPlayerTile();
    
    //map.LAYER_STATE = 'GRAPHIC';
  
    if (map.LAYER_STATE === 'BITMAP') {
  
        for (let f in floors) {
            let floor = floors[f];
            let frame = floor. frame;
            let pathfinderFloor = this.pathfinder.floors[f];



            // ---- Draw Background ---- //

            // Draw floor layers
            console.time('drawWater');
            floor.drawWaterLayer();
            console.timeEnd('drawWater');
            floor.drawBackground();

            // Draw path markers (if on foreground);
            pathfinder.drawMarkers(floor, 'BACKGROUND');
            pathfinder.drawFrontier(floor, 'BACKGROUND');
            pathfinder.drawPath(floor, 'BACKGROUND');
            //pathfinder.drawObstacles(floor, 'BACKGROUND');

            // Draw player
            player.drawPlayer(floor, 'BACKGROUND');


            // ---- Draw Foreground ---- //

            // Draw floor layer
            floor.drawForeground();

            // Draw path markers (if on foreground);
            pathfinder.drawMarkers(floor, 'FOREGROUND');
            pathfinder.drawFrontier(floor, 'FOREGROUND');
            pathfinder.drawPath(floor, 'FOREGROUND');
            //pathfinder.drawObstacles(floor, 'FOREGROUND');

            // Draw player
            player.drawPlayer(floor, 'FOREGROUND');
            
        }
    } else  {
        
        for (let f in floors) {
            this.map.floors[f].drawFloorLayer();
            
        }
        this.drawPlayer();
        
    }
    
    
    
    // Draw rows/cols
    
    // draw on monitor
    // if (map.ROWSCOLS_STATE === 'ON') {
    //     map.drawRowsCols();   
    // };
    
    // Draw Special Tiles
    // .ladder, .occuppied
    //this.drawSprite();
    
    if (this.pathfinder.LAYER_STATE === 'VISUALIZER') {
        //map.drawVisualizerLayer();
    }
    
    
    else if (this.pathfinder.LAYER_STATE === 'ROUTER') {
        //map.drawPathLayer();
    }
    
};


Game.prototype.renderGame = function(path) {
    
    if (path === "/") {
        this.monitor.drawMonitor();
    } else if (path === '/gameboy/') {
        this.gameboy.drawGameboy();
    }

};

Game.prototype.drawShape = function(shape, degree, tile) {
    
    var row = tile.row;
    var col = tile.col;  
    var floor = tile.floor;
    var frame = floor.frame;
    var tile_size = floor.tile_size;
    var x = (col + .5) * tile_size;
    var y = (row + .5) * tile_size;
    
    if (shape.toUpperCase() === 'CIRCLE') {
        frame.ctx.fillStyle = '#FF5722';
        frame.ctx.beginPath();
        frame.ctx.arc(x, y, tile_size/3, 0, Math.PI * 2);
        frame.ctx.fill();
        frame.ctx.closePath();
    }
    
    if (shape.toUpperCase() === 'TRIANGLE') {
        
        var top = {
            x: tile_size / 2,
            y: tile_size / 4
        };
        
        var left = {
            x: tile_size / 4,
            y: (3/4) * tile_size
        };
        
        var right = {
            x: (3/4) * tile_size,
            y: (3/4) * tile_size
        };
        
        var one_fourth = tile_size/4;
        var one_half = tile_size/2;
        
        floor.visualizerlayer.ctx.fillStyle = '#E91E63';
        
        floor.visualizerlayer.ctx.beginPath();
        //floor.visualizerlayer.ctx.arc(x, y, tile_size/3, 0, Math.PI * 2);
        floor.visualizerlayer.ctx.moveTo(x, y - one_fourth);
        floor.visualizerlayer.ctx.lineTo(x - one_fourth, y + one_fourth);
        floor.visualizerlayer.ctx.lineTo(x + one_fourth, y + one_fourth);
        floor.visualizerlayer.ctx.fill();
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


Game.prototype.setPointer = function(x, y, target) {
    
    this.pointer = {
        x: x,
        y: y,
        target: target
    };

};

Game.prototype.getPointer = function() {
    return this.pointer;
};


/*******************************************/
/**********    Player Methods    ***********/
/*******************************************/
Game.prototype.__________PLAYER_METHODS__________ = function() {};


Game.prototype.updatePlayer = function() {
    
    var player = this.player;
    
    if (this.pathfinder.PATH_STATE === 'VISUALIZER') {
        return;
    }

    if (player.MOVE_STATE === 'STILL' ||
            player.MOVE_STATE === 'WALL WALK') { 

        
        if (this.KEYPRESS) {
            // console.log(this.KEYPRESS);
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
        
        player.interpolateMove();
    } 
    
    player.updateSpriteOptions();
    
};

Game.prototype.drawPlayer = function() {
    this.player.drawPlayer();
};


Game.prototype.getPlayerSprites = function() {
    return this.player.getPlayerSprites();
};

Game.prototype.startMove = function() {
    
    var KEYPRESS = this.KEYPRESS;
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
    
    if (KEYPRESS === 'UP') {
        displacement.row = -1;  
    }
    else if (KEYPRESS === 'DOWN') {
        displacement.row = +1; 
    }
    else if (KEYPRESS === 'LEFT') {
        displacement.col = -1;
    }
    else if (KEYPRESS === 'RIGHT') {
        displacement.col = +1;
    }
    
    // ----- 0. Climbing ladder ----- //
    // You were sent here by the end of another move
    if (player.MOVE_STATE === 'LADDER') {
        
        player.startTile = startTile;
        player.stopTile = this.map.getTileOtherEndLadder(startTile);
        
        //this.map.resetPath()
        this.pathfinder.index += 1;
        
        
        var speed = player.getSpeed();
        player.time.total = 1/speed;
        player.time.start = new Date();
        player.interpolateMove();
        return;        
    }
    
    // ----- 1. Turning ----- //
    // If player is still, and user direction does not match player direction
    // and game not currently following path
    if (player.MOVE_STATE === 'STILL' && this.pathfinder.PATH_STATE === 'OFF') {
        
        //console.info('about to turn');
        
        if (KEYPRESS !== player.playerOptions.FACING) {
            console.info('turn');
            player.MOVE_STATE = 'TURN';
            player.changeDirection(KEYPRESS);
            
            // Reset surf counter
            player.surfTicks = 0;
            
            player.startTile = startTile;
            player.stopTile = startTile;
            
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
        
        if (KEYPRESS === player.playerOptions.FACING) {
            player.interpolateMove();
            return;
        }
        
    }
    
    // Determine final tile
    var stopTile = this.map.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If startTile is a ladder
    
    // If stopTile is a ladder
    //    if (stopTile.ladder) {
    //        // Redirect player, move to ladder instead
    //        stopTile = this.getOtherEndLadder(stopTile);
    //    }        
    //    
    // If tile is reachable
    if (stopTile && graph.getEdge(startTile.id, stopTile.id)) {
          
        // Movement is admissable, begin interpolation 
        player.changeDirection(KEYPRESS);
        player.startTile = startTile;
        player.stopTile = stopTile;
        
        
        player.start.row = row;
        player.start.col = col;
        
        player.displacement = displacement;
        
        // Set move state, determine time allotted for move
        var speed;
        // ----- 3. Jumping onto water pokemon ----- //
        if (startTile.type === 'LAND' && stopTile.type === 'WATER') {
            player.MOVE_STATE = 'JUMP ON';    
        } 
        // ----- 4. Jumping off of water pokemon ----- //
        else if (startTile.type === 'WATER' && stopTile.type === 'LAND') {      
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
    else if (stopTile && !graph.getEdge(startTile.id, stopTile.id)) {
        
        // Only animate walking into walls on land
        if(startTile.type === 'LAND') {
            
            player.MOVE_STATE = 'WALL WALK';
            player.changeDirection(KEYPRESS);
            
            player.changeDirection(KEYPRESS);
            player.startTile = startTile;
            player.stopTile = startTile;
            
            var speed = player.getSpeed();
            player.time.total = 1/speed;
            player.time.start = new Date();
            player.interpolateMove();
        }
        
    }
    
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
    return this.player.current;
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



Game.prototype.drawMap = function() {
    
    var map = this.map;
    
    if (map.LAYER_STATE === 'BITMAP') {
        
        map.drawBitmapRockLayers();       
        map.drawBitmapWaterLayers();    
        map.drawBitmapFloorLayers();
        this.drawPlayer();
        if (this.player.tile.type === 'WATER') {
            map.drawBitmapOverlayLayers();
        }

    } else if (map.LAYER_STATE === 'GRAPHIC') {
        map.drawGraphicLayers();
    }
    
    // Draw rows/cols
    if (map.ROWSCOLS_STATE === 'ON') {
        map.drawRowsCols();   
    };
    
    // Draw Special Tiles
    // .ladder, .occuppied
    //this.drawSprite();
    
    if (this.pathfinder.LAYER_STATE === 'VISUALIZER') {
        map.drawVisualizerLayer();
    }
    
    else if (this.pathfinder.LAYER_STATE === 'ROUTER') {
        map.drawPathLayer();
    }
      
};

Game.prototype.drawTransition = function() {
    if (this.player.MOVE_STATE === 'LADDER') {
        this.map.drawMapTransitionLayer();
    }
};

Game.prototype.getLayerState = function() {
    return this.map.LAYER_STATE;  
};

Game.prototype.toggleGrid = function(state) {
    this.map.layers.GRID = state;
};

Game.prototype.toggleMapLayers = function(layer) {
    this.map.LAYER_STATE = layer;
};


Game.prototype.__________TILE_METHODS__________ = function() {};


Game.prototype.getTile = function(floor, row, col) {
    return this.map.getTile(floor, row, col);
};


Game.prototype.getTileSize = function() {
    return this.map.tile_size;    
};


Game.prototype.getTileTopLeft = function(tile) {
    return this.map.getTileTopLeft(tile);    
};


Game.prototype.getMapEuclidDistance = function(tile1, tile2) {
    return this.map.getMapEuclidDistance(tile1, tile2);
};
 
Game.prototype.getMapMaxDistance = function() {
    return this.map.getMapMaxDistance();
}

Game.prototype.setGameState = function(state) {
    this.GAME_STATE = state;    
};

Game.prototype.getGameState = function() {
    return this.GAME_STATE;
};

Game.prototype.getTileFromPointer = function(pointer) {
    return this.monitor.getTileFromPointer(pointer);  
};


Game.prototype.getTileFromId = function(tileId) {
    return this.map.getTileFromId(tileId);
};


Game.prototype.getMapLayers = function() {
    return this.map.layers;
}


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