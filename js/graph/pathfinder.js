var Pathfinder = function(graph) {
    
    this.headOptions = {
        TYPE: 'HEAD',
        GENDER: 'BOY',
        FACING: 'DOWN'
    };    
    
    this.flagOptions = {
        TYPE: 'FLAG',
        EVENT: 'SOURCE'
    };
    
    this.graph = graph;
    this.floors = {};

    
    // Colors used for visualizer and router
    this.hexPath = "#9C27B0";
    this.hexFrom = "#7fffd4";
    this.hexTo = "#673ab7";
    this.alpha = 0.5;
    
    this.LAYER_STATE = null;
  
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
   
    this.console = {
        SOURCE: {
            tile: null
        },
        TARGET: {
            tile: null
        }
    };
    
    this.PATH_STATE = 'OFF';
    
    this.inaccessible = new Set();
    
    
};


Pathfinder.prototype.initMewtwo = function() {
//    
//    var game = this.game;
//    var mewtwo = {};
//    
//    mewtwo.spriteOptions = {
//        TYPE: 'MEWTWO'
//    };
//    
//    mewtwo.tile = this.game.getKeyTile(1); 
//    mewtwo.tile.occupied = true;
//    
//    game.removeEdgesToNeighbors(mewtwo.tile);
//    
//    this.mewtwo = mewtwo;
//    
    //this.inaccessible.add(mewtwo.tile.id);
    
    
    
    //game.addOccipiedTileToGraph();        
};


Pathfinder.prototype.drawMewtwo = function() {
    
  this.game.drawSprite(this.mewtwo.spriteOptions, this.mewtwo.tile);  
    
};


Pathfinder.prototype.init = function() {
    
    this.source = this.game.getPlayerTile();
    this.target = this.game.map.keyTiles[2].tile;
    
    this.flagSource.tile = this.source;
    this.flagTarget.tile = this.target;
    
    this.flagSource.show = true;
    this.flagTarget.show = true;
    
    //this.initMewtwo();
    
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


Pathfinder.prototype.createPathfinderFloorLayers = function() {
    
    var floors = {};
 
    var map = this.game.map;
    
    // Create a canvas object for each floor in the map
    for (let f in map.floors) {
        
        var floor = map.floors[f];
        var floorlayer = floor.bitmap.floorlayer;


        // Create sprite layer
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        
        canvas.width = floorlayer.canvas.width;
        canvas.height = floorlayer.canvas.height;
        
        
        var visualizerlayer = {};
        visualizerlayer.canvas = canvas;
        visualizerlayer.ctx = ctx;       
        floor.visualizerlayer = visualizerlayer;

        
        //        // Create arrow layer
        //        canvas = document.createElement('canvas');  
        //        canvas.width = floorCanvas.width;
        //        canvas.height = floorCanvas.height;
        //        floors[f].arrowlayer = canvas;
        //     
                  
        
        // Create sprite layer
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        
        canvas.width = floorlayer.canvas.width;
        canvas.height = floorlayer.canvas.height;
        
        // Create path layer
        var pathlayer = {};
        pathlayer.canvas = canvas;
        pathlayer.ctx = ctx;       
        floor.pathlayer = pathlayer;    
   
    }  
};


/**************************************/
/**********    Utilities    ***********/
/**************************************/


Pathfinder.prototype._________UTILITIES_________ = function() {};


Pathfinder.prototype.hexToRgba = function(hex, alpha){
    
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

Pathfinder.prototype.rgbaToString = function(rgba) {
  
    return 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ',' + rgba.alpha + ')';
    
};


Pathfinder.prototype.interpolateColor = function(color1, color2, alpha, percent) {
    
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


/***********************************************/
/**********    Pathfinder Methods    ***********/
/***********************************************/


Pathfinder.prototype._________PATHFINDER_METHODS_________ = function() {};


Pathfinder.prototype.startSelect = function(state) {
    
    // Cannot switch from these states to SELECT state    
    if (this.PATH_STATE === 'VISUALIZER' ||
            this.PATH_STATE === 'ROUTER') { return; }
        
    
    if (state === 'SELECT SOURCE') {
        
        // 'SELECT SOURCE' --> 'SELECT SOURCE' : deactivate
        if (this.PATH_STATE === 'SELECT SOURCE') {
            this.flagSource.tile = this.source;
            this.flagSource.show = true;
            this.PATH_STATE = 'OFF';
            return;     
        }
        
        // 'SELECT TARGET' --> 'SELECT SOURCE' : switch
        if (this.PATH_STATE === 'SELECT TARGET') {
            // If clicking while other SELECT is active, switch
            this.flagTarget.tile = this.target;
            this.flagTarget.show = true;
        }
        
        // 'OFF' or 'SELECT TARGET' --> 'SELECT SOURCE' : activate
        this.flagSource.show = false;
        this.PATH_STATE = 'SELECT SOURCE';
        return;
        
    }


    if (state === 'SELECT TARGET') {
               
        if (this.PATH_STATE === 'SELECT TARGET') {
            this.flagTarget.tile = this.target;
            this.flagTarget.show = true;
            this.PATH_STATE = 'OFF';
            return;
        } 
        
        if (this.PATH_STATE === 'SELECT SOURCE') {
            this.flagSource.tile = this.source;
            this.flagSource.show = true;
        }
        
        this.flagTarget.show = false;
        this.PATH_STATE = 'SELECT TARGET';
        return;
    }
    
};


Pathfinder.prototype.startPathfinder = function(state) {
    
    
    // Cannot switch from these states to SELECT state
    if (state === 'SELECT SOURCE' ||
            state === 'SELECT TARGET') {
    
        this.startSelect(state);
    
    }
    
    else if (state === 'VISUALIZER' ||
            state === 'ROUTER') {
        this.startVisualizerRouter(state);
    }
    
};
 

 Pathfinder.prototype.setConsoleTile = function(consoleTile, sourceTarget) {
  
  this.console[sourceTarget].tile = consoleTile;
    
};
 
 
 Pathfinder.prototype.getConsoleTile = function(sourceTarget) {
     
     var game = this.game;
     
     var tile;
     
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
     
//     if (sourceTarget === 'SOURCE') {
//         this.source = tile;
//     } else {
//         this.target = tile;
//     }
//     
     
    
};


 
 Pathfinder.prototype.startVisualizerRouter = function(state) {
     
    // Cannot switch SELECT states to Visualizer or Router   
    if (this.PATH_STATE === 'SELECT SOURCE' ||
            this.PATH_STATE === 'SELECT TARGET') { return; }
   
    var game = this.game;
    var pathfinder = this.pathfinder;
    
    
    this.source = this.getConsoleTile('SOURCE');
    this.target = this.getConsoleTile('TARGET');
    
    this.flagSource.tile = this.source;
    this.flagTarget.tile = this.target;
    

    this.parent = {};
    this.stepbystep = [];
    this.path = [];
    this.step = 0;
    
    // Generate path and timeline
    //this.dijkstra();
    //this.bfs(this.source.id, this.target.id, this.parent, this.path, this.stepbystep);
    //this.dfs();
    this.astar();
    
    // Turn off pathfinder, if in progress
    this.clearPathfinder();
    
    // Move player to source tile
    game.setPlayerMoveState('STILL');
    //var sourceTile = game.getTileFromId(this.source);
    game.setPlayerTile(this.source);
    
    // Reset timeline timer
    this.step = 0;
    if (state === 'VISUALIZER') {
        // Prepare to loop through path backwards
        this.index = this.path.length - 1;
    } else if (state === 'ROUTER') {
        // Prepare to loop through path forwards
        this.index = 0;
    }
    
    // Make player face down
    game.setPlayerFacing('DOWN');
    
    // Turn on path state
    this.LAYER_STATE = state;
    this.PATH_STATE = state;
    //console.log(path);
    
    //game.GAME_STATE = 'PATHFINDING';
    //game.pathfinder.index = 0;
    //game.index = 0;
    
};



Pathfinder.prototype.updateSelect = function() {
    
    var game = this.game;

    if (game.CLICKED) {
        
        var flag;
        if (this.PATH_STATE === 'SELECT SOURCE') {
            flag = this.flagSource;
            if (flag.show) {
                this.source = flag.tile;
            }
            else {
                flag.tile = this.source;
                flag.show = true;
            }
        }
        else if (this.PATH_STATE === 'SELECT TARGET') {
            flag = this.flagTarget;
            if (flag.show) {
                this.target = flag.tile;
            }
            else {
                flag.tile = this.target;
                flag.show = true;
            }
        }
        
        flag.selecting = false;
        this.PATH_STATE = 'OFF';
        game.CLICKED = false;
        return;    
        
    }
    
    //var position = ui.position;
    var pointer = game.getPointer();
    var tile = game.getTileFromPointer(pointer);
    
    // Get flag based on what you're selecting
    var flag = this.PATH_STATE === 'SELECT SOURCE' ? this.flagSource : this.flagTarget;
    
    // If pointer is over a valid tile
    if (tile && tile.type !== 'ROCK') {
        
        flag.tile = tile;
        flag.show = true;
        
    } else { flag.show = false; }
   
};

Pathfinder.prototype.drawFlags = function() {
    
    var game = this.game;
    
    if (this.flagSource.show &&
            (game.getPlayerTile().id !== this.flagSource.tile.id)) {
        
        this.flagOptions.EVENT = 'SOURCE';
        game.drawSprite(this.flagOptions, this.flagSource.tile);
        
    };
    
    if (this.flagTarget.show && 
            (game.getPlayerTile().id !== this.flagTarget.tile.id)) {
        
        this.flagOptions.EVENT = 'TARGET';
        game.drawSprite(this.flagOptions, this.flagTarget.tile);
    }
    
};

//Pathfinder.prototype.drawInacc

Pathfinder.prototype.updatePathfinder = function() {
    
    if (this.PATH_STATE === 'VISUALIZER') {
        this.updateVisualizer();
    } 
    else if (this.PATH_STATE === 'ROUTER') {
        this.updateRouter();
    } else if (this.PATH_STATE === 'SELECT SOURCE' ||
            this.PATH_STATE === 'SELECT TARGET') {
        this.updateSelect();
    }
    
    
};


Pathfinder.prototype.clearPathfinder = function() {
    
    if (this.PATH_STATE === 'SELECT SOURCE' ||
            this.PATH_STATE === 'SELECT TARGET') {
        
        this.flagTarget.tile = this.target;
        this.flagTarget.show = true;
        
        this.flagSource.tile = this.source;
        this.flagSource.show = true;
        
    }
    
    var map = this.game.map;
    
    // Create a canvas object for each floor in the map
    for (let f in map.floors) {
        let visualizerlayer = map.floors[f].visualizerlayer; 
        let width = visualizerlayer.canvas.width;
        let height = visualizerlayer.canvas.height;
        visualizerlayer.ctx.clearRect(0, 0, width, height);
        
        let pathlayer = map.floors[f].pathlayer;   
        width = pathlayer.canvas.width;
        height = pathlayer.canvas.height;
        pathlayer.ctx.clearRect(0, 0, width, height);
        pathlayer.ctx.beginPath();
    }
   
    console.log('clear this up');
    this.PATH_STATE = 'OFF';
    //this.game.setPlayerMoveState("STILL");
    this.game.KEYPRESS = null;
    this.LAYER_STATE = null;
    
};


Pathfinder.prototype._________VISUALIZER_METHODS_________ = function() {};


Pathfinder.prototype.updateVisualizer = function() {

    
    // Add tiles at step `s` to the visualizer layer
    if (this.step < (this.stepbystep.length - 1)) {
        for (let tileId of this.stepbystep[this.step]) {
            this.drawSpriteToVisualizerLayer(tileId, true);
        }
        this.step += 1;
    }
    
    // Follow path (backwards)
    // Color sprites along path
    else if (this.index >= 0) {
        
        let tileId = this.path[this.index];
        this.drawSpriteToVisualizerLayer(tileId, false);
        this.index--;
        
    } else {
        this.PATH_STATE = 'OFF';
        //this.LAYER_STATE = 'VIZUALIZER';
    }
    
};


Pathfinder.prototype.drawSpriteToVisualizerLayer = function(tileId, interpolate) {
    
    var game = this.game;
    var tile = game.getTileFromId(tileId);
    var tile_size = game.getTileSize();
    var floor = tile.floor;
    var visualizerlayer = floor.visualizerlayer;
    
    // Get tile xy
    var row = tile.row;
    var col = tile.col;  
    var tileXY = {};
    tileXY.x = col * tile_size;
    tileXY.y = row * tile_size;
    
    var parent = this.parent;
    
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

    
    // Set composite operation to normal and copy sprite from spritesheet to visualization layer
    visualizerlayer.ctx.globalCompositeOperation = 'source-over';
    
    this.headOptions.GENDER = game.getPlayerGender();
    game.drawSprite(this.headOptions, tile, 'visualizer', false);
  
    
    // Get the shade based on (normalized) euclidean distance from source
    //let sourceTile = game.getTileFromId(this.source);
    let percent = game.getTileEuclidDistance(this.source, tile);
    
    //console.log(source.id, tile.id, percent);
    if (interpolate) {

        this.rgbaFrom = this.hexToRgba(this.hexFrom, this.alpha);
        this.rgbaTo = this.hexToRgba(this.hexTo, this.alpha);
        

        let rgba = this.interpolateColor(this.rgbaFrom, this.rgbaTo, this.alpha, percent);
        visualizerlayer.ctx.fillStyle = rgba;
    
    } else {
        
        this.rgbaPath = this.hexToRgba(this.hexPath, this.alpha);
        let rgba = this.rgbaToString(this.rgbaPath);
        visualizerlayer.ctx.fillStyle = rgba;
    }
    
    // Change composite operation so fill only applies to sprite
    visualizerlayer.ctx.globalCompositeOperation = 'source-atop';
    visualizerlayer.ctx.fillRect(tileXY.x, tileXY.y, tile_size, tile_size);
    
};

Pathfinder.prototype._________ROUTER_METHODS_________ = function() {};


Pathfinder.prototype.updateRouter = function() {
    
    this.simulateKeyPress();
    if (this.PATH_STATE !== 'OFF') {
        //this.game.updatePlayer();

        this.appendPath();
    };
    
};


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


Pathfinder.prototype.appendPath = function() {
    this.game.appendPath(this.hexPath);
};


/***************************************************/
/**********    Pathfinding Algorithms    ***********/
/***************************************************/


Pathfinder.prototype._________PATHFINDING_ALGORITHMS_________ = function() {};

// Follow parent pointer to construct path
Pathfinder.prototype.makePath = function(node, parent, path) {
        
    while (node) {
        path.unshift(node);
        node = parent[node];
    }   
    return path;
    
};


// Run Breadth-First Search
Pathfinder.prototype.bfs = function(source, target, parent, path, stepbystep) {
    
    var q = [];
    //var parent = {};
    this.visited = new Set();
    var visited = this.visited;
    //var timeline = [];
    
    //sNode = graph.getNode(source);
    //sNode.parent = null;
    
    //var inaccessible = this.inaccessible;
    
    parent[source] = null;
    visited.add(source);
    q.push(source); 
    stepbystep.push([]);
    var step = 0;
    stepbystep[step].push(source);
    
    
    while (q.length > 0) {
        
        stepbystep.push([]);

        //        if (this.PATH_STATE === 'VISUALIZE') {
        //            this.updateVisualizationLayer(q, parent, source);
        //            this.game.drawMap();
        //        }
        
        vNode = q.shift();
        
        if (vNode === target) {
            console.log("FOUND!");
            this.makePath(vNode, parent, path);
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
                stepbystep[step].push(uNode);
            }
            
            //this.visited.delete(vNode);
        }
        step += 1;
    }    
};

Pathfinder.prototype.dfs  = function() {
    
    var source = this.source.id;
    var target = this.target.id;
    this.visited = new Set();
    this.parent[source] = null;
    this.visited.add(source);
    
    var found = this.dfs_helper(source, target, this.step);
    if (found) {
        this.makePath(target, this.parent, this.path);
    }
};

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
    var source = this.source.id;
    var target = this.target.id;
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


Pathfinder.prototype.heuristic = function(vNode, uNode) {
    
    var game = this.game;
    
    var vTile = game.getTileFromId(vNode);
    var uTile = game.getTileFromId(uNode);
    
    var delta_row = vTile.row - uTile.row;
    var delta_col = vTile.col - uTile.col;
    
    // Get top/left, or x/y of tile (they're the same thing)
//    var tile1_xy = this.getTileTopLeft(tile1);
//    var tile2_xy = this.getTileTopLeft(tile2);
    
//    var delta_y = tile1_xy.top - tile2_xy.top;
//    var delta_x = tile1_xy.left - tile2_xy.left;
    
    var row2 = Math.pow(delta_row, 2);
    var col2 = Math.pow(delta_col, 2);
    
    var distance = Math.pow(row2 + col2, .5);
    
    return distance;
    
//    var max_width = this.getHeight();
//    var max_height = this.getWidth();
//    
//    var max_height2 = Math.pow(max_height, 2);
//    var max_width2 = Math.pow(max_width, 2);
//    var max_distance = Math.pow(max_width2 + max_height2, .5);
//    
//    return distance/max_distance;
    
};

Pathfinder.prototype.dijkstra = function() {
    
    var pq = new BinaryHeap(function(x){return x[1];});
    //alert(pq);
    
    var source = this.source.id;
    var target = this.target.id;
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
        
        stepbystep.push([]);
        stepbystep[step].push(vNode);
        
        if (vNode === target) {
            console.log('Thank You, Dijkstra!');
            this.makePath(vNode, this.parent, this.path);
            return;
        }
        
        for (let edge of graph.getAdj(vNode)) {
            let uNode = edge.to();
            let relax = distanceTo[vNode] + edge.weight;
            if (relax < distanceTo[uNode]) {
                distanceTo[uNode] = relax;
                parent[uNode] = vNode;
                pq.push([uNode, relax]);
                
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


//
////
//Pathfinder.prototype.appendPartialPath = function() {};
//
//Pathfinder.prototype.createFullPath = function() {};
//
//
////    // Run Breadth-First Search
////    function bfs(graph, source, target) {
////
////        var q = [];
////        var parent = {};
////        var visited = new Set();
////        
////        //sNode = graph.getNode(source);
////        //sNode.parent = null;
////        
////        parent[source] = null;
////        visited.add(source);
////        q.push(source); 
////
////        while (q.length > 0) {
////
////            vNode = q.shift();
////            
////            if (vNode === target) {
////                console.log("FOUND!");
////                var path = makePath(vNode, parent);
////                return path;
////            }
////
////            for (let uNode of graph.getAdj(vNode)) {
////
////                if (!visited.has(uNode)) {
////                    visited.add(uNode);
////                    parent[uNode] = vNode;
////                    q.push(uNode);  
////                }
////            }
////        }    
////    }
//
//

