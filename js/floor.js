// Floor object Constructor
var Floor = function(id, rows, cols) {
    this.id = id;
    this.rows = rows;
    this.cols = cols;
    
    // Initialize all the tiles with a type of 'l' (land)
    this.tiles = new Array(this.rows);
    for (let row = 0; row < this.rows; row++){
        this.tiles[row] = new Array(this.cols)
        for (let col = 0; col < this.cols; col++) {
            this.tiles[row][col] = 'l'
        }        
    }
    console.log(this.tiles);
}

// Check if row/col is in bounds
Floor.prototype.inBounds = function(row, col) {
    return row >= 0 && col >= 0 && row < this.rows && col < this.cols;        
}

// Update floor to reflect map details
Floor.prototype.updateTiles = function(tiles) {
    
    var rocks = tiles.rocks();
    var water = tiles.water();
    
    // Update rock tiles
    for (let i of Object.keys(rocks)) {  
        for (let j of rocks[i]) {
            //console.log(i, j);
            this.tiles[i][j] = 'r'   
        }    
    }
    
    // Update water tiles
    for (let i of Object.keys(water)) {  
        for (let j of water[i]) {
            //console.log(i, j);
            this.tiles[i][j] = 'w'   
        }    
    }
}


Floor.prototype.getTile = function(row, col) {
    if (this.inBounds(row, col)) {
        return this.tiles(row, col);
    }
}

// Get type of tile
Floor.prototype.getTileType = function(row, col) {
    
    if (!this.inBounds(row, col)) {
        return null;
    }
    
    switch (this.tiles[row][col]) {
            
        case 'w':
            return 'water';
        case 'l':
            return 'land';
        case 'r':
            return 'rock';
        default:
            return null

    }
    
}

// Add data from floor to Graph
Floor.prototype.updateGraph = function(tiles, graph) {

    // Create graph with tile data
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            vertex = [r, c];
            graph.addNode(vertex);
            
            // Don't add edges to rock tiles
            let type_vertex = this.getTileType(r, c);
            if (type_vertex === 'rock') {
                continue;
            }
            
            let neighbors = []
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);

            for (let neigh of neighbors) {
                let row = neigh[0];
                let col = neigh[1];
                let type_neigh = this.getTileType(row, col);
                
                if (this.inBounds(row, col) && type_neigh !== 'rock') {
                    graph.addEdge(vertex, neigh);
                }
            }        
        }
    }  
    
    // Remove egdes between certain tiles
    for (edge of tiles.noEdges()) {
        
        graph.removeEdge(edge[0], edge[1]);
        graph.removeEdge(edge[1], edge[0]);
        
    }
    
    console.log(graph);
    //return graph;
}



/*******************************************/
/**********    Canvas Methods    ***********/
/*******************************************/

Floor.prototype.initCanvas = function(canvasId, rows, cols, width) {
    
    // Define canvas objects
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Number of tiles in canvas
    this.canvas.rows = rows || 27;
    this.canvas.cols = cols || 44;
    
    // Compute dimentions of canvas
    var mapWrapperWidth = $('.mapWrapper').width();
    this.canvas.width = width || mapWrapperWidth;
    
    // Compute tile size
    this.tile_size = this.canvas.width / this.canvas.cols;
    
    this.canvas.height = this.tile_size * this.canvas.rows;
    
    this.top_offset = Math.floor((this.canvas.rows - this.rows)/2);
    this.left_offset = Math.floor((this.canvas.cols - this.cols)/2);

    
};

/*---- Reusable Canvas Images ---- */

Floor.prototype.createTileBackground = function() {
    
//    var tile_width = this.tileSize['width'];
//    var tile_height = this.tileSize['height']
    
    
    
    //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); 
    
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    
    tempCtx.fillStyle = '#4CAF50';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    var tile_size = this.tile_size;
       
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {

            let type = this.getTileType(r, c);

            if (type === 'land') {
               tempCtx.fillStyle = '#ccc';
            }

            if (type == 'rock') {
               tempCtx.fillStyle = '#4CAF50';
            }

            if (type == 'water') {
               tempCtx.fillStyle = '#337ab7';
            }

            let x = (c + this.left_offset) * tile_size;
            let y = (r + this.top_offset) * tile_size;
            tempCtx.fillRect(x, y, tile_size, tile_size); 

        }
    }
    
    return this.backgroundTiles = tempCanvas
    
}

Floor.prototype.createRowsCols = function() {
    
    // Create reusable context
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.strokeStyle = 'purple';
    
    for (let r = 0; r <= this.canvas.rows; r++) {
     
        tempCtx.beginPath();
        let y = (r * this.tile_size);
        tempCtx.moveTo(0, y);
        tempCtx.lineTo(tempCanvas.width, y);
        tempCtx.stroke();
        
    }
    
    for (let c = 0; c <= this.canvas.cols; c++) {
     
        tempCtx.beginPath();
        let x = (c * this.tile_size);
        tempCtx.moveTo(x, 0);
        tempCtx.lineTo(x, tempCanvas.height);
        tempCtx.stroke();
        
    }
    
    return this.linesRowsCols = tempCanvas;
    
}


Floor.prototype.createEdges = function(graph) {
     
    //Draw dots to represent edges. Mostly for debugging purposes
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    nodeV = graph.getNode([r,c]);
    
    for (let e of nodeV.edges) {
        let dot_y = e.tile.row;
        let dot_x = e.tile.col;

        dot_x = dot_x*cellSize['width'];
        dot_y = dot_y*cellSize['height'];

        if (dot_y > y) { }
        else if (dot_y == y) { dot_y += ((.5) * cellSize['height']); }
        else if (dot_y < y) { dot_y += cellSize['height']; }

        if (dot_x > x) { }
        else if (dot_x == x) { dot_x += ((.5) * cellSize['width']); }
        else if (dot_x < x) { dot_x += cellSize['width']; }

        ctx.moveTo(dot_x, dot_y);
        ctx.arc(dot_x, dot_y, 1, 0, Math.PI * 2, true);
        ctx.stroke();
    }

    this.dotsEdges = ctx.getImageData(0, 0, this.canvas_width, this.canvas_height);
}


Floor.prototype.drawTileBackground = function() {
    
    if (this.backgroundTiles) {
        this.ctx.drawImage(this.backgroundTiles, 0, 0);
    }

}

Floor.prototype.drawRowsCols = function() {
    
    if (this.linesRowsCols) {
        this.ctx.drawImage(this.linesRowsCols, 0, 0);
    }  
    
}

Floor.prototype.drawEdges = function() {
    
    if (this.dotsEdges) {
        this.ctx.drawImage(this.dotsEdges, 0, 0);
    }  
    
}





Floor.prototype.getXY = function(row, col) {
    
    var x = (col + this.left_offset) * this.tile_size;
    var y = (row + this.top_offset) * this.tile_size;

    return {
        x: x,
        y: y
    }
}
            

Floor.prototype.drawSprite = function(sprite) {
    
    //var xy = this.getXY(row, col)
    this.ctx.drawImage(sprite.canvas, sprite.x, sprite.y); 
    
}

Floor.prototype.moveSprite = function(sprite, start, end) {
    
    // Magic number
    var _speed = 500;
    
    var xy = this.getXY(start.row, start.col);
    start.x = xy.x;
    start.y = xy.y;
    
    xy = this.getXY(end.row, end.col);
    end.x = xy.x;
    end.y = xy.y;
    
    
    // Indicate that sprite is moving
    var that = this;
    this.isMoving = true;
    
    // Define starting time
    var time = {};
    time.start = new Date();
    
    // Get direction of sprite
    var dir = this.getDirection(start, end);
        
    // Interpolate movement
    var lerp = function() {
        
        
        time.current = new Date();
        time.delta = (time.current - time.start)/Math.pow(1000, 2);
        
        var new_x = start.x + (dir.x * _speed * 1000) * time.delta;
        var new_y = start.y + (dir.y * _speed * 1000) * time.delta;
        
        console.log(new_x, new_y);
        
        var a = Math.abs(new_x - start.x);
        var b = Math.abs(end.x - start.x);
        var c = Math.abs(new_y - start.y);
        var d = Math.abs(end.y - start.y);
        
        console.log(a, b, c, d);
        
        if (a > b || c > d) {
            
            new_x = end.x;
            new_y = end.y;
            
            clearInterval(move);
            that.isMoving = false;
            console.log('cleared');
        
        }

        // Update sprite with new positions
        sprite.updateXY(new_x, new_y);
        //that.drawTileBackground();
        //that.drawRowsCols();
        //that.drawSprite(sprite);
    } 
    
    var move = setInterval(lerp, 16);

//    var new_x = end.x;
//    var new_y = end.y;
//    
//    sprite.updateXY(new_x, new_y);
//    that.drawSprite(sprite);


};

Floor.prototype.getDirection = function(start, end) {

    var dir_x = 0;
    var dir_y = 0;

    // Determine direction of movement;
    if (end.row > start.row) {
        // Moving down 
        dir_y = +1;
    } else if (end.row < start.row) {
        // Moving up
        dir_y = -1;
    }

    if (end.col > start.col) {
        // Moving right
        dir_x = +1
    } else if (end.col < start.col) {
        // Moving left
        dir_x = -1
    }

    return {
        x: dir_x,
        y: dir_y
    };
}


Floor.prototype.drawPath = function(sprite, path) {
    
    var i = 0;
    var that = this;
    
    // Simulate pressing
    var drawing = setInterval(function() {
    
        if (!that.isMoving) {
            that.moveSprite(sprite, path[i].tile, path[i+1].tile);
            i++;
            console.log(i);
        }
        
        if (!(i < (path.length - 2))) {          
            clearInterval(drawing);
        }
        
        console.log(i);
        
    }, 30) 
        
//    }
//  
//    for (let i = 0; i < path.length - 1; i++) {
//        
//        this.ctx.drawImage(this.backgroundTiles, 0, 0);    
//        
//        
//    }
}

var _1F_data = function() {
    
    // Define obstacles    
    var rocks = {
        0:  [0, 1, 2, 3, 4, 5, 9, 10, 12,13, 14, 15, 16, 17, 18, 19, 20, 30, 33, 34, 37],
        1:  [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 37],
        2:  [0, 1, 2, 3, 4, 5, 8, 9, 12, 30, 37],
        3:  [0, 2, 3, 4, 5, 8, 9, 12, 23, 27, 30, 31, 33, 34, 35, 36, 37],
        4:  [0, 2, 12, 23, 27],
        5:  [2, 7, 8, 12, 16, 27],
        6:  [2, 7, 8, 12, 16, 27],
        7:  [2, 7, 8, 12, 16, 34],
        8:  [0, 1, 2, 7, 8, 10, 11, 12, 16, 20, 21, 22, 23, 24, 25, 29, 34],
        9:  [0, 2, 7, 11, 12, 16,20, 21, 22, 23, 24, 25, 26, 34],
        10: [0, 7, 11, 12, 16, 17, 19, 20, 21,25, 26, 34],
        11: [0, 7, 16, 21, 25, 26, 30, 31, 32, 33, 34],
        12: [0, 7, 16, 19, 21, 22, 24, 25, 26, 30, 31, 32],
        13: [0, 3, 4, 7, 16, 26, 30],
        14: [0, 3, 7, 11, 16, 17, 24, 25, 26, 30, 36, 37],
        15: [0, 7, 11, 16, 17, 18, 19, 23, 24, 25, 26, 30, 34, 35, 36, 37],
        16: [0, 7, 11, 30, 34, 35, 36, 37],
        17: [0, 1, 2, 3, 5, 6, 7, 11, 12, 14, 30, 34, 35, 36, 37],
        18: [0, 1, 2, 3, 14, 30, 34, 35, 36, 37],
        19: [0, 1, 2, 3, 14, 30, 34, 35, 36, 37],
        20: [0, 1, 2, 3, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34, 35, 36, 37],        
    }
    
    var water = {
        0:  [21, 22, 23, 24, 25, 26, 27, 28, 29],
        1:  [21, 22, 23, 24, 25, 26, 27, 28, 29],
        2:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        3:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        4:  [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        5:  [13, 14, 15, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        6:  [13, 14, 15, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        7:  [13, 14, 15, 35, 36, 37],
        8:  [13, 14, 15, 35, 36, 37],
        9:  [8, 9, 10, 13, 14, 15, 35, 36, 37],
        10: [8, 9, 10, 13, 14, 15, 35, 36, 37],
        11: [8, 9, 10, 11, 12, 13, 14, 15, 35, 36, 37],
        12: [8, 9, 10, 11, 12, 13, 14, 15],
        13: [8, 9, 10, 11, 12, 13, 14, 15],
        14: [8, 9, 10],
    }
    
    var noEdges = [
        
        [ [2,24], [3,24] ],
        [ [2,25], [3,25] ],
        [ [2,26], [3,26] ],
        
        [ [4,17], [5,17] ],    
        [ [4,18], [5,18] ],
        [ [4,19], [5,19] ],
        [ [4,20], [5,20] ],
        [ [4,21], [5,21] ],
        [ [4,22], [5,22] ],
        
        [ [6,28], [7,28] ],    
        [ [6,29], [7,29] ],
        [ [6,30], [7,30] ],
        [ [6,31], [7,31] ],
        [ [6,32], [7,32] ],
        [ [6,33], [7,33] ],
        
        [ [13,12], [14,12] ],    
        [ [13,13], [14,13] ],
        [ [13,14], [14,14] ],
        [ [13,15], [14,15] ],

        [ [15,20], [16,20] ],    
        [ [15,21], [16,21] ],
        [ [15,22], [16,22] ],
        
    ]
    
    var ladders = [
        
        {
            id: 1,
            tile: []
        }
    ]
    
    return {  
        rocks: function() {
            return rocks;   
        },
        
        water: function() {
            return water;
        },   
        
        noEdges: function() {
            return noEdges;
        }
    }
    
}
