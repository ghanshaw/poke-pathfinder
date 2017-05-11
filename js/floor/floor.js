// Floor object Constructor
var Floor = function(game, floor_data) {
    
    // Attach game object
    this.game = game;
    
    // Get data from floor data file
    this.id = floor_data.id();
    this.rows = floor_data.rows();
    this.cols = floor_data.cols();
    this.floor_data = floor_data;
   
    // Bitmap objects from DOM
    this.background = {};
    this.foreground = {};
    
    // Floorlayer canvas object
    this.floorlayer = {};

    // Create 2-day array of tiles
    // All tiles initialized with type 'Land'
    this.tiles = new Array(this.rows);
    for (let row = 0; row < this.rows; row++){
        this.tiles[row] = new Array(this.cols);
        for (let col = 0; col < this.cols; col++) {
            this.tiles[row][col] = new Tile(this, row, col);
        }        
    }
    
    this.tile_size = game.getTileSize();
    
    this.colors = { 
        land: '#ccc', 
        rock:  '#4CAF50',
        water: '#337ab7',
        ladder: '#f3f379',
        border: '#555'
    };
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Floor.prototype._________INITIALIZATION_________ = function() {};


Floor.prototype.init = function(graph) {
  
    // Add floor data to floor
    this.addFloorData();
    
    // Update graph with floor data
    this.addFloorToGraph(graph);
    
    // Aquire background and foreground bitmap images
    this.initBackgroundandForeground();
    
};

// Initialize background and foreground
Floor.prototype.initBackgroundandForeground = function() {
    
    // Get floor background bitmap image from DOM
    var imgId = this.floor_data.imgBackground();
    this.background['img'] = document.getElementById(imgId);
    
    // Get floor foreground bitmap image from DOM
    imgId = this.floor_data.imgForeground();
    // Return if there is not foreground layer
    if (!imgId) { this.foregroudImg = null; }
    this.foreground['img'] = document.getElementById(imgId);           

};

// Create Floor layer for GRAPHIC state
Floor.prototype.initFloorLayer = function() {
    
    // Create blank canvas object
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = this.tile_size * this.cols;
    canvas.height = this.tile_size * this.rows;
    
    var rows = this.rows;
    var cols = this.cols;
    
    // Loop through all tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
     
            // Get tile and tile type
            let tile = this.getTile(r, c);
            let type = this.getTileType(r, c);
            
            // Color tile based on certain conditions
            if (type === 'LAND') {
               ctx.fillStyle = this.colors.land;
            }

            if (type === 'ROCK') {
               ctx.fillStyle = this.colors.rock;
            }

            if (type === 'WATER') {
               ctx.fillStyle = this.colors.water;
            }
            
            if (tile.ladder) {
                ctx.fillStyle = this.colors.ladder;
            }

            // Fill tile accordingly
            let tile_size = this.tile_size;
            let y = r * tile_size;
            let x = c * tile_size;
            ctx.fillRect(x, y, tile_size, tile_size);
            
            // If tile is type rock, continue
            if (type === 'ROCK') { continue; }
            
            //////////////////////
            // Draw borders between tiles of different
            // depths-of-field
            //////////////////////
            
            // Get neighbors of tile
            let neighbors = [];
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);
            
            // Update context
            ctx.strokeStyle = this.colors.border;
            ctx.lineWidth = Math.floor(this.tile_size / 10);
            
            // Loop through neighbors
            for (let neigh of neighbors) {
                
                // Get tile object for neighbors
                let row = neigh[0];
                let col = neigh[1];
                let nTile = this.getTile(row, col);
                
                // If DOF of tiles differ, 
                // and neither is a rock
                // and neither is a staircase
                if (nTile.dof !== tile.dof &&
                        nTile.type !== 'ROCK' && tile.type !== 'ROCK' &&
                        nTile.floor.id === tile.floor.id &&
                        !nTile.stairs && !tile.stairs) {
                    
                        // Determine where to draw border
                        let delta_row = nTile.row - tile.row;
                        let delta_col = nTile.col - tile.col;


                        if (delta_row === -1) {
                            // Draw top boder                        
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + tile_size, y);              
                        }
                        else if (delta_row === 1) {
                            // Draw bottom border
                            ctx.moveTo(x, y + tile_size);
                            ctx.lineTo(x + tile_size, y + tile_size);
                        }
                        else if (delta_col === -1) {
                            // Draw left border
                            ctx.moveTo(x, y);
                            ctx.lineTo(x, y + tile_size);
                        }
                        else if (delta_col === -1) {
                            // Draw right border
                            ctx.moveTo(x + tile_size, y);
                            ctx.lineTo(x + tile_size, y + tile_size);
                        }

                   // Draw border line
                   ctx.stroke();     
                }
            }
        }
    }
    
    // Attach floorlayer to floor
    var floorlayer = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.floorlayer = floorlayer;
};



// Update tiles in floor to reflect map details
Floor.prototype.addFloorData = function() {
    
    var floor_data = this.floor_data;
    
    var rocks = floor_data.rocks();
    var water = floor_data.water();
    var foreground = floor_data.foreground();
    var stairs = floor_data.stairs();
    
    // Update rock tiles
    for (let i of Object.keys(rocks)) {  
        for (let j of rocks[i]) {
            this.tiles[i][j].type = "ROCK";
        }    
    }
    
    // Update water tiles
    for (let i of Object.keys(water)) {  
        for (let j of water[i]) {
            this.tiles[i][j].type = "WATER";   
        }    
    }
    
    // Differentiate foreground and background
    for (let i of Object.keys(foreground)) {  
        for (let j of foreground[i]) {
            this.tiles[i][j].dof = "FOREGROUND";   
        }    
    }
    
    // Update stairs and generate 'pre-stairs'
    // 'Pre-stairs' are the tiles right in front of stairs
    for (let s of stairs) {  
        let row = s[0];
        let col = s[1];
        this.tiles[row][col].stairs = true;  
        this.tiles[row + 1][col].prestairs = true;  
    }
};

// Add data from floor to Graph
Floor.prototype.addFloorToGraph = function(graph) {
    
    // Add nodes to graph
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            
            let tile = this.tiles[r][c];
            
            graph.addNode(tile.id);
           
            // Don't add edges to rock tiles
            if (tile.type === "ROCK") {
                continue;
            }
            
            // Get neighbors
            let neighbors = [];
            neighbors.push([r-1, c]);
            neighbors.push([r+1, c]);
            neighbors.push([r, c-1]);
            neighbors.push([r, c+1]);
            
            // Loop through neighbors
            for (let neigh of neighbors) {
                
                // Get tile from row and column
                let row = neigh[0];
                let col = neigh[1];             
                let nTile = this.getTile(row, col);
                
                // If tile is valid
                if (nTile) {
                    
                    // Don't add edges between tiles of different depths of field
                    // (background or foreground)
                    // unless one of the tiles is a staircase
                    if (nTile.dof !== tile.dof && !nTile.stairs && !tile.stairs) {
                        continue;
                    }
                    
                    // Don't add edges to rock tiles
                    if (nTile.type === 'LAND' ||
                            nTile.type === 'WATER') {
                        graph.addEdge(tile.id, nTile.id);
                    }
                }        
            }
        }
    }      
};


//-------------------------------------//
/////////////////////////////////////////
// Drawing
/////////////////////////////////////////
//-------------------------------------//


Floor.prototype._________DRAW_METHODS_________ = function() {};

// Draw Graphic View view floor layer
Floor.prototype.drawFloorLayer = function() {
    var options = {
        image: this.floorlayer.canvas,
        target: 'floor',
        floorId: this.id,
        dof: 'BACKGROUND'
    };
    this.game.drawImageToScreen(options);
};


//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//


Floor.prototype._________TILE_METHODS_________ = function() {};


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

 // Indicate if floor has water
Floor.prototype.hasWater = function() {
    var water = this.floor_data.water();
    return Object.keys(water).length !== 0;
};



//
//
//
///*---- Grahpic Layers ----*/
//
//Floor.prototype.createGraphicRockLayer = function() {
// 
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    canvas.width = this.frame.canvas.width;
//    canvas.height = this.frame.canvas.height;
//    
//    ctx.fillStyle = '#4CAF50';
//    ctx.fillRect(0, 0, canvas.width, canvas.height);
//    
//    // Attach rocklayer to floor via graphic object
//    var rocklayer = {
//        canvas: canvas,
//        ctx: ctx
//    };
//    
//    this.graphic['rocklayer'] = rocklayer;
//
//};
////
////// Create Floor layer of Grid view
////Floor.prototype.createGraphicFloorLayer = function() {
////    
////    var canvas = document.createElement('canvas');
////    var ctx = canvas.getContext('2d');
////    
////    canvas.width = this.cols * this.tile_size;
////    canvas.height = this.rows * this.tile_size;
////    
////    var rows = this.rows;
////    var cols = this.cols;
////    
////    for (let r = 0; r < rows; r++) {
////        for (let c = 0; c < cols; c++) {
////     
////            let type = this.getTileType(r, c);
////            
////            if (type === 'LAND') {
////               ctx.fillStyle = '#ccc';
////            }
////
////            if (type === 'ROCK') {
////               ctx.fillStyle = '#4CAF50';
////            }
////
////            if (type === 'WATER') {
////               ctx.fillStyle = '#337ab7';
////            }
////            
////            let tile_size = this.tile_size;
////            let y = r * tile_size;
////            let x = c * tile_size;
////            ctx.fillRect(x, y, tile_size, tile_size);
////            //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
////        }
////    }
////    
////    // Attach rocklayer to floor via graphic object
////    var floorlayer = {
////        canvas: canvas,
////        ctx: ctx
////    };
////    
////    this.graphic['floorlayer'] = floorlayer;
////};
////
////
////
//////Floor.prototype.createGraphicPathLayer = function() {
//////    
//////    //Draw dots to represent edges. Mostly for debugging purposes
//////    var canvas = document.createElement('canvas');
//////    var ctx = canvas.getContext('2d');
//////    
//////    //nodeV = graph.getNode([r,c]);
//////    canvas.width = this.canvas.width;
//////    canvas.height = this.canvas.height;
//////    var tile_size = this.tile_size;
//////    
//////    ctx.strokeStyle = 'turquoise';
//////    ctx.beginPath();
//////    ctx.lineWidth = 4;
//////    
//////    this.path.canvas = canvas;
//////    this.path.ctx = ctx;
//////    
//////};
//////
//////
//////
//////
//////// Create edges 
//////Floor.prototype.createEdges = function(graph) {
//////     
//////    //Draw dots to represent edges. Mostly for debugging purposes
//////    var canvas = document.createElement('canvas');
//////    var ctx = canvas.getContext('2d');
//////    
//////    //nodeV = graph.getNode([r,c]);
//////    canvas.width = this.canvas.width;
//////    canvas.height = this.canvas.height;
//////    tile_size = this.tile_size;
//////    
//////    ctx.strokeStyle = 'red';
//////    
//////    for (let v in graph.getNodes()) {
//////        
//////        let tile = this.getTileFromId(v);
//////        
//////        if (!tile) { continue; }
//////        
//////        let row = tile.row;
//////        let col = tile.col;
//////        
//////        for (let u of graph.getAdj(v)) {
//////        
//////            let uTile = this.getTileFromId(u);
//////        
//////            if (!uTile) { continue; }
//////            
//////            let uRow = uTile.row;
//////            let uCol = uTile.col;            
//////
//////            if (uRow > row) { }
//////            else if (uRow === row) { uRow += (.5); }
//////            else if (uRow < row) { uRow += 1; }
//////
//////            if (uCol > col) { }
//////            else if (uCol === col) { uCol += (.5); }
//////            else if (uCol < col) { uCol += 1; }
//////
//////            
//////            let dot_x = uCol * tile_size;
//////            let dot_y = uRow * tile_size;
//////            
//////            ctx.moveTo(dot_x, dot_y);
//////            ctx.arc(dot_x, dot_y, 1, 0, Math.PI * 2, true);
//////            ctx.stroke();            
//////        }  
//////    }
//////    
//////    this.edges = canvas;
//////};
//////












/*---- Reusable Canvas Images ---- */







































//   
//    
//Floor.prototype.createTileRockBackground = function() {
//    
//    var that = this;
//    
//    var tile_size = this.tile_size;
//    
//    var tempCanvas = document.createElement('canvas');
//    var tempCtx = tempCanvas.getContext('2d');
//    
//    tempCanvas.width = this.canvas.width;
//    tempCanvas.height = this.canvas.height;
//    
//    tempCtx.webkitImageSmoothingEnabled = false;
//    tempCtx.mozImageSmoothingEnabled = false;
//    tempCtx.imageSmoothingEnabled = false; 
//    
//
//    
////    tempCanvas.width = this.canvas.width * 2;
////    tempCanvas.height = this.canvas.height * 2;
//    
//    var tileRock = new Image();
//    tileRock.src = 'images/floors/tile_rock.png';
//    
//    var top_offset_pix = that.top_offset * that.tile_size;
//    var left_offset_pix = that.left_offset * that.tile_size;
//    
//    tileRock.addEventListener('load', function() {
//        that.tileRock = tileRock
//    
//        for (let r = 0; r < that.canvas.rows; r++) {
//            for (let c = 0; c < that.canvas.cols; c++) {
//
//                let x = c * tile_size;
//                let y = r * tile_size;
//                tempCtx.drawImage(tileRock, x, y, tile_size, tile_size);
//
//            }
//        }
//        
//        that.tileRockBackground = tempCanvas;
//        
//        //tempCtx.drawImage(tileRock, 0, 0, that.canvas.width, that.canvas.height);
//        tempCtx.drawImage(that.backgroundBitmap, left_offset_pix, top_offset_pix, that.backgroundBitmap.width, that.backgroundBitmap.height);
//        
//        
//        
//        //that.createBitmapBackground();
//        
//    }, false);
//    
//};
//
//Floor.prototype.createTileBackground = function() {
//    
////    var tile_width = this.tileSize['width'];
////    var tile_height = this.tileSize['height']
//    
//    
//    
//    //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); 
//    
//    var tempCanvas = document.createElement('canvas');
//    var tempCtx = tempCanvas.getContext('2d');
//    
////    tempCanvas.width = this.canvas.width;
////    tempCanvas.height = this.canvas.height;
//    
//    tempCanvas.width = this.canvas.width;
//    tempCanvas.height = this.canvas.height;
//    
//    
//    tempCtx.fillStyle = '#4CAF50';
//    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
//    
//    var tile_size = this.tile_size;
//       
//    for (let r = 0; r < this.rows; r++) {
//        for (let c = 0; c < this.cols; c++) {
//
//            let type = this.getTileType(r, c);
//
//            if (type === 'land') {
//               tempCtx.fillStyle = '#ccc';
//            }
//
//            if (type === 'rock') {
//               tempCtx.fillStyle = '#4CAF50';
//            }
//
//            if (type === 'water') {
//               tempCtx.fillStyle = '#337ab7';
//            }
//
//            let x = (c + this.left_offset) * tile_size;
//            let y = (r + this.top_offset) * tile_size;
//            tempCtx.fillRect(x, y, tile_size, tile_size); 
//
//        }
//    }
//    
//    return this.backgroundTiles = tempCanvas;
//    
//};
//
//
//
//
//
//
//
//Floor.prototype.drawTileBackground = function() {
//    
//    if (this.backgroundTiles) {
//        this.ctx.drawImage(this.backgroundTiles, 0, 0);
//    }
//
//};

//
//Floor.prototype.drawBitmapBackground = function() {
//    
//    if (this.backgroundBitmap && this.tileRockBackground) {
//        this.ctx.drawImage(this.tileRockBackground, 0, 0, this.canvas.width, this.canvas.height);
//        //this.ctx.drawImage(this.backgroundBitmap, 0, 0, this.canvas.width, this.canvas.height);
//    }
//
//};


//Floor.prototype.drawRowsCols = function() {
//    
//    if (this.linesRowsCols) {
//        this.ctx.drawImage(this.linesRowsCols, 0, 0);
//    }  
//    
//};

//Floor.prototype.drawEdges = function() {
//    
//    if (this.dotsEdges) {
//        this.ctx.drawImage(this.dotsEdges, 0, 0);
//    }  
//    
//};







//
//// Draw Grid view rock layer
//Floor.prototype.drawGraphicRockLayer = function() {
//    this.frame.ctx.drawImage(this.graphic.rocklayer.canvas, 0, 0);
//};
//
//
//
//// Draw Grid view rows/cols
//Floor.prototype.drawRowsCols = function() {    
//    //this.frame.ctx.drawImage(this.rowscols.canvas, 0, 0);
//};
//
//// Draw Grid view key tiles
//Floor.prototype.drawKeyTiles = function() {
//    this.frame.ctx.drawImage(this.keytiles.canvas, this.frame.offset_x, this.frame.offset_y);
//};
//
//// Draw Grid view edges
//Floor.prototype.drawEdges = function() {
//    this.frame.ctx.drawImage(this.edges.canvas, this.frame.offset_x, this.frame.offset_y);
//};
//
//Floor.prototype.drawShape = function(shape, tile, color) {
//    
//    var row = tile.row;
//    var col = tile.col;  
//    var floor = tile.floor;
//    var frame = floor.frame;
//    var tile_size = floor.tile_size;
//    var x = col * tile_size;
//    var y = row * tile_size;
//    
//    if (shape.toUpperCase() === 'CIRCLE') {
//        frame.ctx.fillStyle = '#FF5722';
//        frame.ctx.beginPath();
//        frame.ctx.arc(x, y, tile_size/3, 0, Math.PI * 2);
//        frame.ctx.fill();
//        frame.ctx.closePath();
//    }
//    
//    if (shape.toUpperCase() === 'SQUARE') {
//        frame.ctx.strokeStyle = '#FF5722';
//        frame.ctx.strokeRect(x, y, tile_size, tile_size);
//    }
//    
//};


//
///*******************************************/
///**********    Canvas Methods    ***********/
///*******************************************/
//
//
//Floor.prototype.__________FRAME_CANVAS_METHODS__________ = function() {};
//
//
//
//Floor.prototype.createFrame = function() {
//        
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//
//    var img = this.background.img;
//    
//    this.width = canvas.width = img.width;
//    this.height = canvas.height = img.height;
//    
//    this.tile_size = img.width / this.cols;
//    
//    this.frame = {
//        canvas: canvas,
//        ctx: ctx
//    };
//    
//};
//
//
//Floor.prototype.createWaterLayer = function() {
//    
//    
//    var game = this.game;
//    this.waterlayer = Array(8);
//   
//    var waterOptions = {
//        TYPE: 'TILE',
//        SURFACE: 'WATER',
//        NUM: 0
//    };
//    
//    var rows = this.rows;
//    var cols = this.cols;
//    var tile_size = this.tile_size;
//    
//    for (var i = 0; i < 8; i++) {
//        
//        // Create a new canvas for each layer of water
//        var canvas = document.createElement('canvas');
//        var ctx = canvas.getContext('2d');
//
//        ctx.mozImageSmoothingEnabled = false;
//        ctx.webkitImageSmoothingEnabled = false;
//        ctx.msImageSmoothingEnabled = false;
//        ctx.imageSmoothingEnabled = false;
//
//        canvas.width = this.cols * this.tile_size;
//        canvas.height = this.rows * this.tile_size;        
//        
//        // Update water sprite options
//        waterOptions.NUM = i;
//        var waterSprite = game.spritesheet.getSprite(waterOptions);
//        
//        // draw sprite to ctx
//        for (let r = 0; r < rows; r++) {
//            for (let c = 0; c < cols; c++) {
//                
//                let y = r * tile_size;
//                let x = c * tile_size;
//                
//                ctx.drawImage(waterSprite.canvas, x, y, tile_size, tile_size);
//                
//            }
//        }
//        
//        
//        // Attach rocklayer to floor via bitmap object
//        var layer = {
//            canvas: canvas,
//            ctx: ctx
//        };
//        
//        this.waterlayer[i] = layer;
//    }
//    
//    //this.frame.ctx.drawImage(this.bitmap.rocklayer.canvas, this.frame.offset_x, this.frame.offset_y);
//    console.log(this);
//    
//};
//
//
//// Draw animated water layer
//Floor.prototype.drawWaterLayer = function() {
//    let i = Math.floor( (this.game.ticks/16) % 8 );    
//    this.frame.ctx.drawImage(this.waterlayer[i].canvas, 0, 0, this.frame.canvas.width, this.frame.canvas.height);
//};
//
//// Draw background
//Floor.prototype.drawBackground = function() {
//    this.frame.ctx.drawImage(this.backgroundImg, 0, 0);
//};
//
//// Draw foreground
//Floor.prototype.drawForeground = function() {
//    
//    // Not every floor has an foreground
//    if (this.foregroundImg) {
//        this.frame.ctx.drawImage(this.foregroundImg, 0, 0);
//    }
//    
//};
//
//
//
//
//
//// Draw Grid view edges
//Floor.prototype.drawPathLayer = function() {
//    console.log('Drawing  path layer');
//    this.frame.ctx.drawImage(this.pathlayer.canvas, 0, 0);
//};
//
//
//Floor.prototype.drawVisualizerLayer = function() {
//    //console.log(this.visualizerlayer);
//    this.frame.ctx.drawImage(this.visualizerlayer.canvas, 0, 0);
//};
//
//
//Floor.prototype.createFram = function(tile_size, rows, cols) {
//     
////    // Get canvas Id
////    var canvasId = this.floor_data.canvasId();
////    
////    // Define canvas objects
//    //    var canvas = document.getElementById(canvasId);
//    //    var ctx = canvas.getContext('2d');
//    
//    
//    
//    ctx.mozImageSmoothingEnabled = false;
//    ctx.webkitImageSmoothingEnabled = false;
//    ctx.msImageSmoothingEnabled = false;
//    ctx.imageSmoothingEnabled = false;
//      
//    // Number of rows/cols in frame
//    var frame_rows = rows || 27;
//    var frame_cols = cols || 44;
//    
//    var floor_rows = this.rows;
//    var floor_cols = this.cols;
//    
//    // Update canvas height
//    canvas.width = tile_size * frame_cols;
//    canvas.height = tile_size * frame_rows;
//    
//    // Compute offsets of floor from frame
//    var offset_rows = Math.floor((frame_rows - floor_rows)/2);
//    var offset_cols = Math.floor((frame_cols - floor_cols)/2);
//    
//    var offset_x = offset_cols * tile_size;
//    var offset_y = offset_rows * tile_size;
//
//    this.tile_size = tile_size;
//    
//    // Create frame object to hold canvas, related data;
//    var frame = {};
//    
//    frame.canvas = canvas;
//    frame.ctx = ctx;
//    frame.rows = frame_rows;
//    frame.cols = frame_cols;
//    frame.offset_rows = offset_rows;
//    frame.offset_cols = offset_cols;
//    frame.offset_x = offset_x;
//    frame.offset_y = offset_y;
//    
//    this.frame = frame;
//    
//};
//
//
///* ---- Bitmap Layers ---- */
//
//// Nope
//Floor.prototype.createBitmapRockLayer = function() {
//    
//    var game = this.game;
//    
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    ctx.mozImageSmoothingEnabled = false;
//    ctx.webkitImageSmoothingEnabled = false;
//    ctx.msImageSmoothingEnabled = false;
//    ctx.imageSmoothingEnabled = false;
//    
//    canvas.width = this.frame.canvas.width;
//    canvas.height = this.frame.canvas.height;
//    
//    var rows = this.frame.rows;
//    var cols = this.frame.cols;
//    var tile_size = this.tile_size;
//    
//    //var tile_rock = document.getElementById('tile-rock');
//    
//    var rockOptions = {
//        TYPE: 'TILE',
//        SURFACE: 'ROCK',
//        NUM: 0
//    };
//    
//    var rockSprite = game.spritesheet.getSprite(rockOptions);
//    
//    for (let r = 0; r < rows; r++) {
//        for (let c = 0; c < cols; c++) {
//     
//            let y = r * tile_size;
//            let x = c * tile_size;
//
//            ctx.drawImage(rockSprite.canvas, x, y, tile_size, tile_size);
//            
//        }
//    }
//    
//    // Attach rocklayer to floor via bitmap object
//    var rocklayer = {
//        canvas: canvas,
//        ctx: ctx
//    };
//    
//    this.bitmap['rocklayer'] = rocklayer;
//};
//
//
//
//
//Floor.prototype.drawImageToFrame = function(img, tile, span=1) {
//    
//    if (!tile) {
//       var frame = this.frame;
//       this.frame.ctx.drawImage(img, 0, 0); 
//       return;
//    }
//    
//    var row = tile.row;
//    var col = tile.col;  
//    var floor = tile.floor;
//    var frame = floor.frame;
//    var tile_size = floor.tile_size;
//
//    var offset = (1 - span)/2;
//
//    var x = (col + offset) * tile_size;
//    var y = (row + offset) * tile_size;
//
//    floor.frame.ctx.drawImage(img, x, y, tile_size * span, tile_size * span);
//
//};
//
//
//
//
//
//
//
//// Draw Bitmap rock layer
//Floor.prototype.drawBitmapRockLayer = function() {
//    this.frame.ctx.drawImage(this.bitmap.rocklayer.canvas, 0, 0);
//};
//
//
//
//
////// Draw Bitmap floor layer
////Floor.prototype.drawBitmapFloorLayer = function() {
////    this.frame.ctx.drawImage(this.bitmap.floorlayer.canvas, this.frame.offset_x, this.frame.offset_y);
////};
////
//
//Floor.prototype.appendPath = function(color, player) {
//    
//   
//    
//    var x = player.current.col * this.tile_size;
//    var y = player.current.row * this.tile_size;
//    
//    // Adjust path during jump on/jump off
//    if (player.STATE === 'JUMP ON' || player.STATE === 'JUMP OFF') {
//        if (player.current.row < player.stopTile.row && player.playerOptions.FACING !== 'DOWN') {
//            var y = player.stopTile.row * this.tile_size;
//        }
//    }
//    
//    x += this.tile_size / 2;
//    y += this.tile_size / 2;        
//    
//    var canvas = this.pathlayer.canvas;
//    var ctx = this.pathlayer.ctx;
//    ctx.strokeStyle = color;
//    ctx.lineTo(x, y);
//    ctx.stroke();
//    
//    
//    //ctx.beginPath();
//    
//    
//        //ctx.closePath();
//        //ctx.moveTo(x, y);
//        
//    
//    //ctx.beginPath();
//    
//    //ctx.lineTo(startXY.x, startXY.y, endXY.x, endXY.y);
//    
//    
//};

//Floor.prototype.createPathfinderFloorLayer = function() {
//    
//    var floorlayer = this.bitmap.floorlayer;
//    
//    
//    // Create sprite layer
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    
//    canvas.width = floorlayer.canvas.width;
//    canvas.height = floorlayer.canvas.height;
//    
//    
//    var visualizerlayer = {};
//    visualizerlayer.canvas = canvas;
//    visualizerlayer.ctx = ctx;       
//    floor.visualizerlayer = visualizerlayer;
//    
//    
//    //        // Create arrow layer
//    //        canvas = document.createElement('canvas');  
//    //        canvas.width = floorCanvas.width;
//    //        canvas.height = floorCanvas.height;
//    //        floors[f].arrowlayer = canvas;
//    //     
//    
//    // Create path layer
//    var pathlayer = {};
//    pathlayer.canvas = canvas;
//    pathlayer.ctx = ctx;       
//    this.pathlayer = pathlayer;    
//    
//
//};


//// Create key tile indicators
//Floor.prototype.createKeyTiles = function() {
//
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    canvas.width = this.cols * this.tile_size;
//    canvas.height = this.rows * this.tile_size;
//    
//    // Semi-transparent yellow
//    ctx.fillStyle = 'rgba(255, 193, 7, .3)';
//
//    var tile_size = this.tile_size;
//      
//    for (let ladder of this.floor_data.ladders()) {
//        
//        let tile_arr = ladder.tile;
//
//        let row = tile_arr[0];
//        let col = tile_arr[1];
//        
//        let y = row * tile_size;
//        let x = col * tile_size;
//        
//        ctx.fillRect(x, y, tile_size, tile_size);
//        //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
//    }
//    
//    this.keytiles.canvas = canvas;
//    this.keytiles.ctx = ctx;
//
//};

//
//
//// Create key tile indicators
//Floor.prototype.createKeyTiles = function() {
//
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    canvas.width = this.cols * this.tile_size;
//    canvas.height = this.rows * this.tile_size;
//    
//    // Semi-transparent yellow
//    ctx.fillStyle = 'rgba(255, 193, 7, .3)';
//
//    var tile_size = this.tile_size;
//      
//    for (let ladder of this.floor_data.ladders()) {
//        
//        let tile_arr = ladder.tile;
//
//        let row = tile_arr[0];
//        let col = tile_arr[1];
//        
//        let y = row * tile_size;
//        let x = col * tile_size;
//        
//        ctx.fillRect(x, y, tile_size, tile_size);
//        //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
//    }
//    
//    this.keytiles.canvas = canvas;
//    this.keytiles.ctx = ctx;
//
//};
//
//
//Floor.prototype.getXY = function(row, col) {
//    
//    var x = (col + this.left_offset) * this.tile_size;
//    var y = (row + this.top_offset) * this.tile_size;
//
//    return {
//        x: x,
//        y: y
//    };
//};       