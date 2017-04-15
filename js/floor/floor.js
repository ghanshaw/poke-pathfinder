// Floor object Constructor
var Floor = function(floor_data) {
    this.id = floor_data.id();
    this.rows = floor_data.rows();
    this.cols = floor_data.cols();
    this.floor_data = floor_data;
   
    // Create canvas objects
    this.frame = {};
    this.bitmap = {};
    this.graphic = {};
    this.rowscols = {};
    
    
    // Initialize all the tiles with a type of 'l' (land)
    this.tiles = new Array(this.rows);
    for (let row = 0; row < this.rows; row++){
        this.tiles[row] = new Array(this.cols);
        for (let col = 0; col < this.cols; col++) {
            this.tiles[row][col] = new Tile(this, row, col);
        }        
    }
    
    console.log(this.tiles);
};

// Update floor to reflect map details
Floor.prototype.addFloorData = function() {
    
    var floor_data = this.floor_data;
    
    var rocks = floor_data.rocks();
    var water = floor_data.water();
    var ladders = floor_data.ladders();
    
    // Update rock tiles
    for (let i of Object.keys(rocks)) {  
        for (let j of rocks[i]) {
            //console.log(i, j);
            this.tiles[i][j].type = "ROCK";
        }    
    }
    
    // Update water tiles
    for (let i of Object.keys(water)) {  
        for (let j of water[i]) {
            //console.log(i, j);
            this.tiles[i][j].type = "WATER";   
        }    
    }
    
    // Update ladder tiles
    for (let ladder of ladders) { 
        let id = ladder.id;
        let tile = ladder.tile;
        this.tiles[tile[0]][tile[1]].ladder = true; 
        this.tiles[tile[0]][tile[1]].ladderId = id;
    }
};


// Add data from floor to Graph
Floor.prototype.addFloorToGraph = function(graph) {

    // Create graph with tile data
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            let tile = this.tiles[r][c];
            graph.addNode(tile.id);
            //vertex = [floor.id, r, c];
            //graph.addNode(vertex);
            
            // Don't add edges to rock tiles
            if (tile.type === "ROCK") {
                continue;
            }
            
            let neighbors = [];
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);

            for (let neigh of neighbors) {
                let row = neigh[0];
                let col = neigh[1];
                
                let nTile = this.getTile(row, col);
                //let type_neigh = this.getTileType(row, col);
                
                if (this.inBounds(row, col) && nTile.type !== "ROCK") {
                    graph.addEdge(tile.id, nTile.id);
                }
            }        
        }
    }  
    
    // Remove egdes between certain tiles
    for (let edge of this.floor_data.noEdges()) {
        let u = edge[0];
        let v = edge[1];
        
        let uTile = this.getTile(u[0], u[1]);
        let vTile = this.getTile(v[0], v[1]);
        graph.removeEdge(uTile.id, vTile.id); 
        graph.removeEdge(vTile.id, uTile.id); 
    }
    
};


// Check if row/col is in bounds
Floor.prototype.inBounds = function(row, col) {
    return row >= 0 && col >= 0 && row < this.rows && col < this.cols;        
};


// Get tile object corresponding to row/col
Floor.prototype.getTile = function(row, col) {
    if (this.inBounds(row, col)) {
        return this.tiles[row][col];
    }
};

// Get tile object corresponding to id
Floor.prototype.getTileFromId = function(tileId) {
    
    var tile_arr = tileId.split(',');
    
    if (this.id === tile_arr[0]) {
        return this.getTile(tile_arr[1], tile_arr[2]);        
    } 
};

// Get type of tile
Floor.prototype.getTileType = function(row, col) {
    
    if (!this.inBounds(row, col)) {
        return null;
    }
    
    return this.tiles[row][col].type;
    
};





/*******************************************/
/**********    Canvas Methods    ***********/
/*******************************************/

Floor.prototype.createFrame = function(tile_size, rows, cols) {
     
    // Get canvas Id
    var canvasId = this.floor_data.canvasId();
    
    // Define canvas objects
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
      
    // Number of rows/cols in frame
    var frame_rows = rows || 27;
    var frame_cols = cols || 44;
    
    var floor_rows = this.rows;
    var floor_cols = this.cols;
    
    // Update canvas height
    canvas.width = tile_size * frame_cols;
    canvas.height = tile_size * frame_rows;
    
    // Compute offsets of floor from frame
    var offset_rows = Math.floor((frame_rows - floor_rows)/2);
    var offset_cols = Math.floor((frame_cols - floor_cols)/2);
    
    var offset_x = offset_cols * tile_size;
    var offset_y = offset_rows * tile_size;

    this.tile_size = tile_size;
    
    // Create frame object to hold canvas, related data;
    var frame = {};
    
    frame.canvas = canvas;
    frame.ctx = ctx;
    frame.rows = frame_rows;
    frame.cols = frame_cols;
    frame.offset_rows = offset_rows;
    frame.offset_cols = offset_cols;
    frame.offset_x = offset_x;
    frame.offset_y = offset_y;
    
    this.frame = frame;
    
};


/* ---- Bitmap Layers ---- */

Floor.prototype.createBitmapRockLayer = function() {
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.frame.canvas.width;
    canvas.height = this.frame.canvas.height;
    
    var rows = this.frame.rows;
    var cols = this.frame.cols;
    var tile_size = this.tile_size;
    
    var tile_rock = document.getElementById('tile-rock');
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
     
            let y = r * tile_size;
            let x = c * tile_size;

            ctx.drawImage(tile_rock, x, y, tile_size, tile_size);
            
        }
    }
    
    // Attach rocklayer to floor via bitmap object
    var rocklayer = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.bitmap['rocklayer'] = rocklayer;
};


Floor.prototype.createBitmapFloorLayer = function() {
       
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.cols * this.tile_size;
    canvas.height = this.rows * this.tile_size;
    
    // Get floor map png from html img
    var imgId = this.floor_data.imgId();
    var floor_img = document.getElementById(imgId);

    // Draw image to canvas
    ctx.drawImage(floor_img, 0, 0, canvas.width, canvas.height);
    
    
    
    // Attach floorlayer to floor via bitmap object
    var floorlayer = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.bitmap['floorlayer'] = floorlayer;
    
};

// Draw Bitmap rock layer
Floor.prototype.drawBitmapRockLayer = function() {
    this.frame.ctx.drawImage(this.bitmap.rocklayer.canvas, 0, 0);
};

// Draw Bitmap floor layer
Floor.prototype.drawBitmapFloorLayer = function() {
    this.frame.ctx.drawImage(this.bitmap.floorlayer.canvas, this.frame.offset_x, this.frame.offset_y);
};


/*---- Grahpic Layers ----*/

Floor.prototype.createGraphicRockLayer = function() {
 
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.frame.canvas.width;
    canvas.height = this.frame.canvas.height;
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Attach rocklayer to floor via graphic object
    var rocklayer = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.graphic['rocklayer'] = rocklayer;

};

// Create Floor layer of Grid view
Floor.prototype.createGraphicFloorLayer = function() {
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.cols * this.tile_size;
    canvas.height = this.rows * this.tile_size;
    
    var rows = this.rows;
    var cols = this.cols;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
     
            let type = this.getTileType(r, c);
            
            if (type === 'LAND') {
               ctx.fillStyle = '#ccc';
            }

            if (type === 'ROCK') {
               ctx.fillStyle = '#4CAF50';
            }

            if (type === 'WATER') {
               ctx.fillStyle = '#337ab7';
            }
            
            let tile_size = this.tile_size;
            let y = r * tile_size;
            let x = c * tile_size;
            ctx.fillRect(x, y, tile_size, tile_size);
            //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
        }
    }
    
    // Attach rocklayer to floor via graphic object
    var floorlayer = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.graphic['floorlayer'] = floorlayer;
};


// Create lines of rows/cols
Floor.prototype.createRowsCols = function() {
    
    // Create reusable context
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.frame.canvas.width;
    canvas.height = this.frame.canvas.height;
    ctx.strokeStyle = 'purple';
    
    for (let r = 0; r <= this.frame.rows; r++) {
     
        ctx.beginPath();
        let y = (r * this.tile_size);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
    };
    
    for (let c = 0; c <= this.frame.cols; c++) {
     
        ctx.beginPath();
        let x = (c * this.tile_size);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
    };
    
    this.rowscols = {
        canvas: canvas,
        ctx: ctx
    };
    
};

Floor.prototype.createGraphicPathLayer = function() {
    
    //Draw dots to represent edges. Mostly for debugging purposes
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    //nodeV = graph.getNode([r,c]);
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    var tile_size = this.tile_size;
    
    ctx.strokeStyle = 'turquoise';
    ctx.beginPath();
    ctx.lineWidth = 4;
    
    this.path.canvas = canvas;
    this.path.ctx = ctx;
    
};

Floor.prototype.appendPath = function(player) {
    
   
    if (player.tile.floor.id === this.id) {
        
        var x = player.current.col * this.tile_size;
        var y = player.current.row * this.tile_size;
        
        // Adjust path during jump on/jump off
        if (player.MOVE_STATE === 'JUMP ON' || player.MOVE_STATE === 'JUMP OFF') {
            if (player.current.row < player.endTile.row && player.playerOptions.FACING !== 'DOWN') {
                var y = player.endTile.row * this.tile_size;
            }
        }
        
        x += this.tile_size / 2;
        y += this.tile_size / 2;        
        
        var canvas = this.graphic.path;
        var ctx = canvas.getContext('2d');
        
        //ctx.beginPath();
        //ctx.strokeStyle = 'turquoise';
        ctx.lineTo(x, y);
        ctx.stroke();
        //ctx.closePath();
        //ctx.moveTo(x, y);
        
    }
    
    //ctx.beginPath();
    
    //ctx.lineTo(startXY.x, startXY.y, endXY.x, endXY.y);
    
    
};



// Create edges 
Floor.prototype.createEdges = function(graph) {
     
    //Draw dots to represent edges. Mostly for debugging purposes
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    //nodeV = graph.getNode([r,c]);
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    tile_size = this.tile_size;
    
    ctx.strokeStyle = 'red';
    
    for (let v in graph.getNodes()) {
        
        let tile = this.getTileFromId(v);
        
        if (!tile) { continue; }
        
        let row = tile.row;
        let col = tile.col;
        
        for (let u of graph.getAdj(v)) {
        
            let uTile = this.getTileFromId(u);
        
            if (!uTile) { continue; }
            
            let uRow = uTile.row;
            let uCol = uTile.col;            

            if (uRow > row) { }
            else if (uRow === row) { uRow += (.5); }
            else if (uRow < row) { uRow += 1; }

            if (uCol > col) { }
            else if (uCol === col) { uCol += (.5); }
            else if (uCol < col) { uCol += 1; }

            
            let dot_x = uCol * tile_size;
            let dot_y = uRow * tile_size;
            
            ctx.moveTo(dot_x, dot_y);
            ctx.arc(dot_x, dot_y, 1, 0, Math.PI * 2, true);
            ctx.stroke();            
        }  
    }
    
    this.edges = canvas;
};



// Create key tile indicators
Floor.prototype.createKeyTiles = function() {

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.cols * this.tile_size;
    canvas.height = this.rows * this.tile_size;
    
    // Semi-transparent yellow
    ctx.fillStyle = 'rgba(255, 193, 7, .3)';

    var tile_size = this.tile_size;
      
    for (let ladder of this.floor_data.ladders()) {
        
        let tile_arr = ladder.tile;

        let row = tile_arr[0];
        let col = tile_arr[1];
        
        let y = row * tile_size;
        let x = col * tile_size;
        
        ctx.fillRect(x, y, tile_size, tile_size);
        //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
    }
    
    this.keytiles.canvas = canvas;
    this.keytiles.ctx = ctx;

};


// Draw Grid view rock layer
Floor.prototype.drawGraphicRockLayer = function() {
    this.frame.ctx.drawImage(this.graphic.rocklayer.canvas, 0, 0);
};

// Draw Grid view floor layer
Floor.prototype.drawGraphicFloorLayer = function() {
    this.frame.ctx.drawImage(this.graphic.floorlayer.canvas, this.frame.offset_x, this.frame.offset_y);
};

// Draw Grid view rows/cols
Floor.prototype.drawRowsCols = function() {    
    this.frame.ctx.drawImage(this.rowscols.canvas, 0, 0);
};

// Draw Grid view key tiles
Floor.prototype.drawKeyTiles = function() {
    this.frame.ctx.drawImage(this.keytiles.canvas, this.frame.offset_x, this.frame.offset_y);
};

// Draw Grid view edges
Floor.prototype.drawEdges = function() {
    this.frame.ctx.drawImage(this.edges.canvas, this.frame.offset_x, this.frame.offset_y);
};

// Draw Grid view edges
Floor.prototype.drawPath = function() {
    this.frame.ctx.drawImage(this.path, this.frame.offset_x, this.frame.offset_y);
};


Floor.prototype.drawVisualizationLayer = function() {
    //console.log(this.visualizationlayer);
    this.frame.ctx.drawImage(this.visualizationlayer.canvas, this.frame.offset_x, this.frame.offset_y);
};


/*---- Reusable Canvas Images ---- */









































Floor.prototype.createBitmapBackground = function() {
    
    var that = this;
    
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.width = this.cols * this.tile_size;
    tempCanvas.height = this.height = this.rows * this.tile_size;
    
    tempCtx.webkitImageSmoothingEnabled = false;
    tempCtx.mozImageSmoothingEnabled = false;
    tempCtx.imageSmoothingEnabled = false; 
    
    

    
    
    var backgroundBitmap = new Image();   // Create new img element
    backgroundBitmap.src = 'images/floors/1F.png'; //
    
//    var top_offset_pix = that.top_offset * that.tile_size;
//    var left_offset_pix = that.left_offset * that.tile_size;
    
    backgroundBitmap.addEventListener('load', function() {
        //tempCtx.drawImage(that.tileRockBackground, 0, 0, that.canvas.width, that.canvas.height);
        //tempCtx.drawImage(backgroundBitmap, left_offset_pix, top_offset_pix, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(backgroundBitmap, 0, 0, tempCanvas.width, tempCanvas.height);
        that.backgroundBitmap = tempCanvas;
        that.createTileRockBackground();
        
    }, false);
    
    
    //this.tileRock = 
    
}
    
    
Floor.prototype.createTileRockBackground = function() {
    
    var that = this;
    
    var tile_size = this.tile_size;
    
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    
    tempCtx.webkitImageSmoothingEnabled = false;
    tempCtx.mozImageSmoothingEnabled = false;
    tempCtx.imageSmoothingEnabled = false; 
    

    
//    tempCanvas.width = this.canvas.width * 2;
//    tempCanvas.height = this.canvas.height * 2;
    
    var tileRock = new Image();
    tileRock.src = 'images/floors/tile_rock.png';
    
    var top_offset_pix = that.top_offset * that.tile_size;
    var left_offset_pix = that.left_offset * that.tile_size;
    
    tileRock.addEventListener('load', function() {
        that.tileRock = tileRock
    
        for (let r = 0; r < that.canvas.rows; r++) {
            for (let c = 0; c < that.canvas.cols; c++) {

                let x = c * tile_size;
                let y = r * tile_size;
                tempCtx.drawImage(tileRock, x, y, tile_size, tile_size);

            }
        }
        
        that.tileRockBackground = tempCanvas;
        
        //tempCtx.drawImage(tileRock, 0, 0, that.canvas.width, that.canvas.height);
        tempCtx.drawImage(that.backgroundBitmap, left_offset_pix, top_offset_pix, that.backgroundBitmap.width, that.backgroundBitmap.height);
        
        
        
        //that.createBitmapBackground();
        
    }, false);
    
}

Floor.prototype.createTileBackground = function() {
    
//    var tile_width = this.tileSize['width'];
//    var tile_height = this.tileSize['height']
    
    
    
    //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); 
    
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    
//    tempCanvas.width = this.canvas.width;
//    tempCanvas.height = this.canvas.height;
    
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

            if (type === 'rock') {
               tempCtx.fillStyle = '#4CAF50';
            }

            if (type === 'water') {
               tempCtx.fillStyle = '#337ab7';
            }

            let x = (c + this.left_offset) * tile_size;
            let y = (r + this.top_offset) * tile_size;
            tempCtx.fillRect(x, y, tile_size, tile_size); 

        }
    }
    
    return this.backgroundTiles = tempCanvas;
    
};







Floor.prototype.drawTileBackground = function() {
    
    if (this.backgroundTiles) {
        this.ctx.drawImage(this.backgroundTiles, 0, 0);
    }

};


Floor.prototype.drawBitmapBackground = function() {
    
    if (this.backgroundBitmap && this.tileRockBackground) {
        this.ctx.drawImage(this.tileRockBackground, 0, 0, this.canvas.width, this.canvas.height);
        //this.ctx.drawImage(this.backgroundBitmap, 0, 0, this.canvas.width, this.canvas.height);
    }

};


//Floor.prototype.drawRowsCols = function() {
//    
//    if (this.linesRowsCols) {
//        this.ctx.drawImage(this.linesRowsCols, 0, 0);
//    }  
//    
//};

Floor.prototype.drawEdges = function() {
    
    if (this.dotsEdges) {
        this.ctx.drawImage(this.dotsEdges, 0, 0);
    }  
    
};




Floor.prototype.getXY = function(row, col) {
    
    var x = (col + this.left_offset) * this.tile_size;
    var y = (row + this.top_offset) * this.tile_size;

    return {
        x: x,
        y: y
    };
};
        