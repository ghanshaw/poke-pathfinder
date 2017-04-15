var Pathfinder = function(graph) {
    
    this.spriteOptions = {
        TYPE: 'PLAYER',
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'LEFT'
    };    
    
    this.graph = graph;
    this.floors = {};
    //this.map = map;
    

    
    
};

Pathfinder.prototype.initSprite = function() {
    
    var spritesheet = new SpriteSheet(spritesheet_data);
    spritesheet.initCanvas('bw');
    this.spritesheet = spritesheet;
      
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
        
        
        var visualizationlayer = {};
        visualizationlayer.canvas = canvas;
        visualizationlayer.ctx = ctx;       
        visualizationlayer.marked = new Set();
        floor.visualizationlayer = visualizationlayer;

        
        //        // Create arrow layer
        //        canvas = document.createElement('canvas');  
        //        canvas.width = floorCanvas.width;
        //        canvas.height = floorCanvas.height;
        //        floors[f].arrowlayer = canvas;
        //        
        //        // Create path layer
        //        canvas = document.createElement('canvas'); 
        //        canvas.width = floorCanvas.width;
        //        canvas.height = floorCanvas.height;
        //        floors[f].pathlayer = canvas;       
   
    }
    
};

/**************************************/
/**********    Utilities    ***********/
/**************************************/

Pathfinder.prototype.hexToRGB = function(hex){
    
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return {
            red: (c >> 16) & 255,
            green: (c >> 8 ) &255,
            blue: c & 255
        };
    }
    throw new Error('Bad Hex');
    
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

Pathfinder.prototype.updatePathfinder = function() {
    
    if (this.PATH_STATE === 'VISUALIZE') {
        this.updateVisualizationLayer();
    } 
    else if (this.PATH_STATE === 'ROUTE') {
        //this.updatePathFollow();
    }
    
};

Pathfinder.prototype.updateVisualizationLayer = function() {
    
    var game = this.game;
    //source = game.getTileFromId(source);
        
    // Add tiles for at time `t` to visualization layer
    if (this.time < (this.timeline.length - 1)) {
        for (let tileId of this.timeline[this.time]) {
        
            let tile = game.getTileFromId(tileId);
            let tile_size = game.getTileSize();
            let floor = tile.floor;
            let visualizationlayer = floor.visualizationlayer;
        
            // If the sprite hasn't been drawn yet
            if (!visualizationlayer.marked.has(tileId)) {
            
                // Get tile xy
                let row = tile.row;
                let col = tile.col;  
                let tileXY = {};
                tileXY.x = col * tile_size;
                tileXY.y = row * tile_size;
            
                // Get sprite's xy position
                let spriteXY = {};
                spriteXY.x = tileXY.x - (.5 * tile_size);
                spriteXY.y = tileXY.y - (.5 * tile_size);
            
                // Update sprite based on direction from parent
                this.spriteOptions.GENDER = game.getPlayerGender();
            
                parent = this.parent;
            
                // If tile does not have a parent pointer, sprite faced down
                if (!parent[tileId]) {
                    this.spriteOptions.FACING = 'DOWN';
                }
                // Otherwise
                else {
                
                    let parentTile = game.getTileFromId(parent[tileId]);
                
                    // Determine displacement from startTile to endTile
                    let displacement = {
                        row: 0,
                        col: 0
                    };
                
                    displacement.row = parentTile.row - tile.row;
                    displacement.col = parentTile.col - tile.col;
                
                    // Use displacement to determine direction
                    if (displacement.row === -1) {
                        this.spriteOptions.FACING = 'UP';
                    }
                    else if (displacement.row === +1) {
                        this.spriteOptions.FACING = 'DOWN';
                    }
                    else if (displacement.col === -1) {
                        this.spriteOptions.FACING = 'LEFT';
                    }
                    else if (displacement.col === +1) {
                        this.spriteOptions.FACING = 'RIGHT';
                    }
                
                }
            
                // Get x, y of sprite on sprite sheet
                let xy = this.spritesheet.getXY(this.spriteOptions);
                let sx = xy.x;
                let sy = xy.y;
                let sprite_size = this.spritesheet.sprite_size;
            
                // Set composite operation to normal and copy sprite from spritesheet to visualization layer
                visualizationlayer.ctx.globalCompositeOperation = 'source-over';
                visualizationlayer.ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, spriteXY.x, spriteXY.y, tile_size * 2, tile_size * 2);
            
            
                // Get the shade based on (normalized) euclidean distance from source
                let sourceTile = game.getTileFromId(this.source);
                let percent = game.getTileEuclidDistance(sourceTile, tile);
            
                //console.log(source.id, tile.id, percent);
            
                var hexFrom = "#7fffd4";
                var hexTo = "#673ab7";
            
                this.rgbFrom = this.hexToRGB(hexFrom);
                this.rgbTo = this.hexToRGB(hexTo);
                this.alpha = .5;
            
                let rgba = this.interpolateColor(this.rgbFrom, this.rgbTo, this.alpha, percent);
                visualizationlayer.ctx.fillStyle = rgba;
                console.log(rgba);
            
                // Change composite operation so fill only applies to sprite
                visualizationlayer.ctx.globalCompositeOperation = 'source-atop';
                visualizationlayer.ctx.fillRect(tileXY.x, tileXY.y, tile_size, tile_size);
            
                // Add sprite to list of marked tiles
                visualizationlayer.marked.add(tileId); 
            }
        }
        this.time += 1;
    }
    
    //Follow path (backwards)
    else if (this.index >= 0) {
        
        let tileId = this.path[this.index];
        
        let tile = game.getTileFromId(tileId);
        let tile_size = game.getTileSize();
        let floor = tile.floor;
        let visualizationlayer = floor.visualizationlayer;
        
        // Get tile xy
        let row = tile.row;
        let col = tile.col;  
        let tileXY = {};
        tileXY.x = col * tile_size;
        tileXY.y = row * tile_size;
        
        // Get sprite's xy position
        let spriteXY = {};
        spriteXY.x = tileXY.x - (.5 * tile_size);
        spriteXY.y = tileXY.y - (.5 * tile_size);
        
        // Update sprite based on direction from parent
        this.spriteOptions.GENDER = game.getPlayerGender();
        
        parent = this.parent;
        
        // If tile does not have a parent pointer, sprite faced down
        if (!parent[tileId]) {
            this.spriteOptions.FACING = 'DOWN';
        }
        // Otherwise
        else {
            
            let parentTile = game.getTileFromId(parent[tileId]);
            
            // Determine displacement from startTile to endTile
            let displacement = {
                row: 0,
                col: 0
            };
            
            displacement.row = parentTile.row - tile.row;
            displacement.col = parentTile.col - tile.col;
            
            // Use displacement to determine direction
            if (displacement.row === -1) {
                this.spriteOptions.FACING = 'UP';
            }
            else if (displacement.row === +1) {
                this.spriteOptions.FACING = 'DOWN';
            }
            else if (displacement.col === -1) {
                this.spriteOptions.FACING = 'LEFT';
            }
            else if (displacement.col === +1) {
                this.spriteOptions.FACING = 'RIGHT';
            }
            
        }
        
        // Get x, y of sprite on sprite sheet
        let xy = this.spritesheet.getXY(this.spriteOptions);
        let sx = xy.x;
        let sy = xy.y;
        let sprite_size = this.spritesheet.sprite_size;
        
        // Set composite operation to normal and copy sprite from spritesheet to visualization layer
        visualizationlayer.ctx.globalCompositeOperation = 'source-over';
        visualizationlayer.ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, spriteXY.x, spriteXY.y, tile_size * 2, tile_size * 2);
        
        
        // Get the shade based on (normalized) euclidean distance from source
        let sourceTile = game.getTileFromId(this.source);
        let percent = game.getTileEuclidDistance(sourceTile, tile);
        
        //console.log(source.id, tile.id, percent);
        
        var hexFrom = "#cb2d3e";
        var hexTo = "#cb2d3e";
        
        this.rgbFrom = this.hexToRGB(hexFrom);
        this.rgbTo = this.hexToRGB(hexTo);
        this.alpha = .5;
        
        let rgba = this.interpolateColor(this.rgbFrom, this.rgbTo, this.alpha, percent);
        visualizationlayer.ctx.fillStyle = rgba;
        console.log(rgba);
        
        // Change composite operation so fill only applies to sprite
        visualizationlayer.ctx.globalCompositeOperation = 'source-atop';
        visualizationlayer.ctx.fillRect(tileXY.x, tileXY.y, tile_size, tile_size);
        
        // Add sprite to list of marked tiles
        visualizationlayer.marked.add(tileId); 
        
        this.index--;
    }
    else {
        this.PATH_STATE = 'OFF';
    }
    
    
    
    
};





Pathfinder.prototype.startPathfinder = function(state) {
    
    
   
    var entrance = this.game.map.keyTiles[0].tile;
    var mewtwo = this.game.map.keyTiles[2].tile;
    
    console.log(entrance);
    console.log(mewtwo);
    
    var source = entrance.id;
    var target = mewtwo.id;
    
    this.source = source;
    this.target = target;
    this.parent = {};
    this.timeline = [];
    this.time = 0;
    
    // Generate path and timeline
    this.bfs(this.source, this.target, this.parent, this.timeline, this.time);
    
    // Reset timeline timer
    this.time = 0;
    this.index = this.path.length - 1;
    
    // Turn on path state
    this.PATH_STATE = state;
    //console.log(path);
    
    //game.GAME_STATE = 'PATHFINDING';
    //game.pathfinder.index = 0;
    //game.index = 0;
    
};



/***************************************************/
/**********    Pathfinding Algorithms    ***********/
/***************************************************/


// Follow parent pointer to construct path
Pathfinder.prototype.makePath = function(node, parent) {
    
    var path = [];
    
    while (node) {
        path.unshift(node);
        node = parent[node];
    }
    
    return path;
    
};



// Run Breadth-First Search
Pathfinder.prototype.bfs = function(source, target, parent, timeline, time) {
    
    var q = [];
    //var parent = {};
    var visited = new Set();
    //var timeline = [];
    
    //sNode = graph.getNode(source);
    //sNode.parent = null;
    
    parent[source] = null;
    visited.add(source);
    q.push(source); 
    timeline.push([]);
    timeline[time].push(source);
    
    
    while (q.length > 0) {
        
        timeline.push([]);

        //        if (this.PATH_STATE === 'VISUALIZE') {
        //            this.updateVisualizationLayer(q, parent, source);
        //            this.game.drawMap();
        //        }
        
        vNode = q.shift();
        
        if (vNode === target) {
            console.log("FOUND!");
            this.path = this.makePath(vNode, parent);
            this.timeline = timeline;
            return;
            //console.log(timeline);
            //return this.path;
        }
        
        for (let uNode of this.graph.getAdj(vNode)) {
            
            if (!visited.has(uNode)) {
                visited.add(uNode);
                parent[uNode] = vNode;
                q.push(uNode);  
                timeline[time].push(uNode);
            }
        }
        time += 1;
    }    
};

//
Pathfinder.prototype.appendPartialPath = function() {};

Pathfinder.prototype.createFullPath = function() {};


//    // Run Breadth-First Search
//    function bfs(graph, source, target) {
//
//        var q = [];
//        var parent = {};
//        var visited = new Set();
//        
//        //sNode = graph.getNode(source);
//        //sNode.parent = null;
//        
//        parent[source] = null;
//        visited.add(source);
//        q.push(source); 
//
//        while (q.length > 0) {
//
//            vNode = q.shift();
//            
//            if (vNode === target) {
//                console.log("FOUND!");
//                var path = makePath(vNode, parent);
//                return path;
//            }
//
//            for (let uNode of graph.getAdj(vNode)) {
//
//                if (!visited.has(uNode)) {
//                    visited.add(uNode);
//                    parent[uNode] = vNode;
//                    q.push(uNode);  
//                }
//            }
//        }    
//    }



