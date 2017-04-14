var Pathfinder = function(map) {
    
    spriteOptions = {
        TYPE: 'PLAYER',
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'LEFT'
    };    
    
    this.floors = {};
    this.map = map;
    
};

Pathfinder.prototype.initPathfinder = function() {
    
    var spritesheet = new SpriteSheet();
    spritesheet.initCanvas('bw');
    this.spritesheet = spritesheet;
      
};


Pathfinder.prototype.createFloorLayers = function(map) {
    
    var floors = {};
    
    // Create a canvas object for each floor in the map
    for (let f of map.floors) {
        
        var floorCanvas = map.floors[f].bitmap.floorlayer;

        // Create sprite layer
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        canvas.width = floorCanvas.width;
        canvas.height = floorCanvas.height;
        
        var spritelayer = {};
        spritelayer.canvas = canvas;
        spritelayer.ctx = ctx;       
        spritelayer.marked = new Set();
        floors[f].spritelayer = spritelayer;
        

        
        // Create arrow layer
        canvas = document.createElement('canvas');  
        canvas.width = floorCanvas.width;
        canvas.height = floorCanvas.height;
        floors[f].arrowlayer = canvas;
        
        // Create path layer
        canvas = document.createElement('canvas'); 
        canvas.width = floorCanvas.width;
        canvas.height = floorCanvas.height;
        floors[f].pathlayer = canvas;       
   
    }
    
};



Pathfinder.prototype.updateSpriteLayer = function(map, queue, parent, source) {
    
    source = map.getTleFromId(source);
    
    // Draw all the nodes currently in the queue
    for (let tileId of queue) {
        
        
        let tile = map.getTileFromId(tileId);
        //let tile_size = map.tile_size;
        let tile_size = 16;
        let floorId = tile.floor.id;
        let spritelayer = this.floors[floorId].spritelayer;
        
        // If the sprite hasn't been drawn yet
        if (!spritelayer.marked.has(tileId)) {
            
            // Calculate x, y of sprite on sprite layer
            let row = tile.row;
            let col = tile.col;    
            let x = col * tile_size + - (.5 * tile_size);
            let y = row * tile_size + - (.5 * tile_size);
            
            // Update sprite based on direction from parent
            this.spriteOptions.GENDER = map.GENDER;
            if (!parent[tileId]) {
                this.spriteOptions.FACING = 'DOWN';
            }
            else {
                
                let parentTile = map.getTileFromId(parent[tileId]);
                
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
            xy = this.spritesheet.getXY(this.spriteOptions);
            let xy = this.spritesheet.getXY(this.playerOptions);
            let sx = xy.x;
            let sy = xy.y;
            let sprite_size = this.spritesheet.sprite_size;
            
            // Set composite operation to normal and draw sprite from spritesheet to spritelayer
            spritelayer.ctx.globalCompositeOperation = 'source-over';
            spritelayer.ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);
            
            // Get the shade based on (normalized) euclidean distance from source
            let percent = this.calcDistance(source, tile);
            let rgba = interpolationColor(this.rgbFrom, this.rgbTo, this.alpha, percent);
            spritelayer.ctx.fillStyle = rgba;
            
            
            // Change composite operation so fill only applies to sprite
            spritelayer.ctx.globalCompositeOperation = 'source-atop';
            spritelayer.ctx.fillRect(x, y, tile_size, tile_size);
            
            // Add sprite to list of marked cells
            spritelayer.marked.add(tileId);
            
        }
             
    }
    
};






// 
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

Pathfinder.prototype.calcDistance = function(source, node) {
    
    var sourceT = map.getTileFromId(source);
    var nodeT = map.getTileFromId(node);
    
    var delta_y = sourceT.row - nodeT.row * map.tile_size;
    var delta_x = sourceT.col - nodeT.col * map.tile_size;
    
    var x2 = Math.pow(delta_x, 2);
    var y2 = Math.pow(delta_y, 2);
    
    var distance = Math.pow(x2 + y2, .5);
    
    var max_width = $('caveWrapper').width();
    var max_height = $('caveWrapper').height();
    
    
    var max_height2 = Math.pow(max_height, 2);
    var max_width2 = Math.pow(max_width, 2);
    var max_distance = Math.pow(max_width2 + max_height2, .5);
    
    return distance/max_distance;
    
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
Pathfinder.function.bfs = function(graph, source, target, map) {
    
    var q = [];
    var parent = {};
    var visited = new Set();
    
    //sNode = graph.getNode(source);
    //sNode.parent = null;
    
    parent[source] = null;
    visited.add(source);
    q.push(source); 
    
    while (q.length > 0) {

        vNode = q.shift();
        
        if (this.PATH_STATE === 'VISUALIZE') {
            this.updateSpriteLayer();
        }
        
        if (vNode === target) {
            console.log("FOUND!");
            var path = makePath(vNode, parent);
            return path;
        }
        
        for (let uNode of graph.getAdj(vNode)) {
            
            if (!visited.has(uNode)) {
                visited.add(uNode);
                parent[uNode] = vNode;
                q.push(uNode);  
            }
        }
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



