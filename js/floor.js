// Floor object Constructor
var Floor = function(floor_data) {
    this.id = floor_data.id();
    this.rows = floor_data.rows();
    this.cols = floor_data.cols();
    this.floor_data = floor_data;
    
    // Initialize all the tiles with a type of 'l' (land)
    this.tiles = new Array(this.rows);
    for (let row = 0; row < this.rows; row++){
        this.tiles[row] = new Array(this.cols)
        for (let col = 0; col < this.cols; col++) {
            this.tiles[row][col] = new Tile(this, row, col)
        }        
    }
    
    console.log(this.tiles);
}

// Update floor to reflect map details
Floor.prototype.updateTiles = function() {
    
    var floor_data = this.floor_data
    
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
}


// Check if row/col is in bounds
Floor.prototype.inBounds = function(row, col) {
    return row >= 0 && col >= 0 && row < this.rows && col < this.cols;        
}


// Get tile object corresponding to row/col
Floor.prototype.getTile = function(row, col) {
    if (this.inBounds(row, col)) {
        return this.tiles[row][col];
    }
}

// Get tile object corresponding to id
Floor.prototype.getTileFromId = function(tileId) {
    
    var tile_arr = tileId.split(',');
    
    if (this.id === tile_arr[0]) {
        return this.getTile(tile_arr[1], tile_arr[2]);        
    } 
}

// Get type of tile
Floor.prototype.getTileType = function(row, col) {
    
    if (!this.inBounds(row, col)) {
        return null;
    }
    
    return this.tiles[row][col].type;
    
}

// Add data from floor to Graph
Floor.prototype.updateGraph = function(graph) {

    // Create graph with tile data
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            let tile = this.tiles[r][c];
            graph.addNode(tile.id)
            //vertex = [floor.id, r, c];
            //graph.addNode(vertex);
            
            // Don't add edges to rock tiles
            if (tile.type === "ROCK") {
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
                
                let nTile = this.getTile(row, col)
                //let type_neigh = this.getTileType(row, col);
                
                if (this.inBounds(row, col) && nTile.type !== "ROCK") {
                    graph.addEdge(tile.id, nTile.id);
                }
            }        
        }
    }  
    
    // Remove egdes between certain tiles
    for (edge of this.floor_data.noEdges()) {
        let u = edge[0];
        let v = edge[1];
        
        let uTile = this.getTile(u[0], u[1]);
        let vTile = this.getTile(v[0], v[1]);
        graph.removeEdge(uTile.id, vTile.id); 
        graph.removeEdge(vTile.id, uTile.id); 
    }
    
}



/*******************************************/
/**********    Canvas Methods    ***********/
/*******************************************/

Floor.prototype.initCanvas = function(rows, cols, width) {
    
    // Get canvas Id
    var canvasId = this.floor_data.canvasId()
    
    // Define canvas objects
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    this.canvas = canvas;
    this.ctx = ctx;
    
    // Number of tiles in canvas
    this.canvas.rows = rows || 27;
    this.canvas.cols = cols || 44;
    
    // Compute dimentions of canvas
    var mapWrapperWidth = $('.mapWrapper').width();
    this.canvas.width = width || mapWrapperWidth;
    //this.canvas.width = 1280;
    
    // Compute tile size
    this.tile_size = Math.floor(this.canvas.width / this.canvas.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    // Update canvas height
    this.canvas.width = this.tile_size * this.canvas.cols;
    
    this.canvas.height = this.tile_size * this.canvas.rows;
    //this.canvas.height = 736;
    
    // Computer offsets of floor from canvas
    this.top_offset = Math.floor((this.canvas.rows - this.rows)/2);
    this.left_offset = Math.floor((this.canvas.cols - this.cols)/2);
    
    this.offset_x = this.left_offset * this.tile_size;
    this.offset_y = this.top_offset * this.tile_size;

    // Store layers for both bitmap view and grid view
    this.bitmap = {};
    this.graphic = {};
};


/* ---- Bitmap Layers ---- */

Floor.prototype.createBitmapRockLayer = function() {
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    
    var rows = this.canvas.rows;
    var cols = this.canvas.cols;
    var tile_size = this.tile_size;
    
    var tile_rock = document.getElementById('tile-rock');
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
     
            let y = r * tile_size;
            let x = c * tile_size;
            //console.log(x, y);
            ctx.drawImage(tile_rock, x, y, tile_size, tile_size);
            
        }
    }
    
    this.bitmap.rocklayer = canvas;
    //this.ctx.drawImage(canvas, 0, 0);
}


Floor.prototype.createBitmapFloorLayer = function() {
       
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.cols * this.tile_size;
    canvas.height = this.rows * this.tile_size;
    
    var imgId = this.floor_data.imgId();
    
    var floor_img = document.getElementById(imgId);
    
    var x_offset = this.left_offset * this.tile_size;
    var y_offset = this.top_offset * this.tile_size;
    
    
    ctx.drawImage(floor_img, 0, 0, canvas.width, canvas.height);
    
    this.x_offset = x_offset;
    this.y_offset = y_offset;
    this.bitmap.floorlayer = canvas;
    
}

// Draw Bitmap rock layer
Floor.prototype.drawBitmapRockLayer = function() {
    this.ctx.drawImage(this.bitmap.rocklayer, 0, 0);
}

// Draw Bitmap floor layer
Floor.prototype.drawBitmapFloorLayer = function() {
    this.ctx.drawImage(this.bitmap.floorlayer, this.offset_x, this.offset_y);
}


/*---- Grahpic Layers ----*/

Floor.prototype.createGraphicRockLayer = function() {
 
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    this.graphic.rocklayer = canvas;
    
    this.ctx.drawImage(canvas, 0, 0);
    
}

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
            
            let tile_size = this.tile_size
            let y = r * tile_size;
            let x = c * tile_size;
            ctx.fillRect(x, y, tile_size, tile_size);
            //this.ctx.fillRect(this.offset_x + x, this.offset_y + y, tile_size, tile_size);
        }
    }
    
    this.graphic.floorlayer = canvas;
}


// Create lines of rows/cols
Floor.prototype.createGraphicRowsCols = function() {
    
    // Create reusable context
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    ctx.strokeStyle = 'purple';
    
    for (let r = 0; r <= this.canvas.rows; r++) {
     
        ctx.beginPath();
        let y = (r * this.tile_size);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
    }
    
    for (let c = 0; c <= this.canvas.cols; c++) {
     
        ctx.beginPath();
        let x = (c * this.tile_size);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
    }
    
    this.graphic.rowscols = canvas;
    //this.ctx.drawImage(canvas, 0, 0);
    
}


// Create edges 
Floor.prototype.createGraphicEdges = function(graph) {
     
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
        
        for (let e of graph.getEdges(v)) {
        
            let eTile = this.getTileFromId(e);
        
            if (!eTile) { continue; }
            
            let eRow = eTile.row;
            let eCol = eTile.col;            

            if (eRow > row) { }
            else if (eRow == row) { eRow += (.5); }
            else if (eRow < row) { eRow += 1; }

            if (eCol > col) { }
            else if (eCol == col) { eCol += (.5); }
            else if (eCol < col) { eCol += 1; }

            
            let dot_x = eCol * tile_size;
            let dot_y = eRow * tile_size;
            
            ctx.moveTo(dot_x, dot_y);
            ctx.arc(dot_x, dot_y, 1, 0, Math.PI * 2, true);
            ctx.stroke();            
        }  
    }
    
    this.graphic.edges = canvas;
}



// Create key tile indicators
Floor.prototype.createGraphicKeyTiles = function() {

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
    
    this.graphic.keytiles = canvas;

}


// Draw Grid view rock layer
Floor.prototype.drawGraphicRockLayer = function() {
    this.ctx.drawImage(this.graphic.rocklayer, 0, 0);
}

// Draw Grid view floor layer
Floor.prototype.drawGraphicFloorLayer = function() {
    this.ctx.drawImage(this.graphic.floorlayer, this.offset_x, this.offset_y);
}

// Draw Grid view rows/cols
Floor.prototype.drawGraphicRowsCols = function() {    
    this.ctx.drawImage(this.graphic.rowscols, 0, 0);
}

// Draw Grid view key tiles
Floor.prototype.drawGraphicKeyTiles = function() {
    this.ctx.drawImage(this.graphic.keytiles, this.offset_x, this.offset_y);
}

// Draw Grid view edges
Floor.prototype.drawGraphicEdges = function() {
    this.ctx.drawImage(this.graphic.edges, this.offset_x, this.offset_y);
}

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







Floor.prototype.drawTileBackground = function() {
    
    if (this.backgroundTiles) {
        this.ctx.drawImage(this.backgroundTiles, 0, 0);
    }

}


Floor.prototype.drawBitmapBackground = function() {
    
    if (this.backgroundBitmap && this.tileRockBackground) {
        this.ctx.drawImage(this.tileRockBackground, 0, 0, this.canvas.width, this.canvas.height);
        //this.ctx.drawImage(this.backgroundBitmap, 0, 0, this.canvas.width, this.canvas.height);
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
            

Floor.prototype.drawSprite = function() {
    
    var sprite = this.sprite;
    
    //var xy = this.getXY(row, col)
    this.ctx.drawImage(sprite.canvas, sprite.x, sprite.y); 
    
}


Floor.prototype.followPath = function() {        
    
    var sprite = this.sprite;
    var path = this.path;
    
    if (!path) {
        return;
    }
    
    if (sprite.status != 'WALKING' && path.index < path.length - 1) {
        
        let i = path.index;
        path.index += 1;
        //this.moveTile(path[i].tile, path[i+1].tile, sprite);
        this.initMove(path[i].tile, path[i+1].tile, sprite);
        
    }
       
}

Floor.prototype.initMove = function(start, end, sprite) {

    sprite.start = start;
    sprite.end = end;
    
    xy = this.getXY(start.row, start.col);
    start.x = xy.x;
    start.y = xy.y;
    
    xy = this.getXY(end.row, end.col);
    end.x = xy.x;
    end.y = xy.y;  
    
    sprite.time.start = new Date();
    sprite.status = 'WALKING';
    sprite.dir = this.getDirection(start, end);
    
}



Floor.prototype.lerpMove = function() {
    
    var _speed = 10;   // tiles per second
    var sprite = this.sprite;
    
    if (sprite.status !== 'WALKING') {
        return;
    }
    
    var start = sprite.start;
    var end = sprite.end;
    var time = sprite.time;
    var dir = sprite.dir;
    
    time.current = new Date();
    time.delta = (time.current - time.start)/Math.pow(1000, 2);
    
//    var new_x = start.x + (dir.x * _speed * 1000) * time.delta;
//    var new_y = start.y + (dir.y * _speed * 1000) * time.delta;

    var new_col = start.col + (dir.x * _speed * 1000) * time.delta;
    var new_row = start.row + (dir.y * _speed * 1000) * time.delta;
    
    var newXY = this.getXY(new_row, new_col);
    
    //console.log(new_x, new_y);

//    var a = Math.abs(new_x - start.x);
//    var b = Math.abs(end.x - start.x);
//    var c = Math.abs(new_y - start.y);
//    var d = Math.abs(end.y - start.y);
    
    var a = Math.abs(newXY.x - start.x);
    var b = Math.abs(end.x - start.x);
    var c = Math.abs(newXY.y - start.y);
    var d = Math.abs(end.y - start.y);

    console.log(a, b, c, d);

    if (a > b || c > d) {

        newXY.x = end.x;
        newXY.y = end.y;
        
//        new_x = end.x;
//        new_y = end.y;

        sprite.status = 'STANDING';
        sprite.start = null;
        sprite.end = null;
        sprite.time = {};
        sprite.updateXY(newXY.x, newXY.y);
    
    }

    // Update sprite with new positions
    //sprite.updateXY(new_x, new_y);
    sprite.updateXY(newXY.x, newXY.y);
    //that.drawTileBackground();
    
}



Floor.prototype.moveTile = function(start, end, sprite) {
    // Exit if sprite is currently walking
    if (sprite.status == 'WALKING') {
        return;   
    }
    
    // Exit if end tile is out of bounds
    if (!this.inBounds(end.row, end.col)) {
        return; 
    }   
    
    
    //sprite.floor = floor.id;
    sprite.row = end.row;
    sprite.col = end.col;
    
    var xy = this.getXY(sprite.row, sprite.col);
    sprite.x = xy.x;
    sprite.y = xy.y;

}


Floor.prototype.moveSprite = function(sprite, start, end, delta_t) {
    
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


Floor.prototype.moveSpriteOld = function(sprite, start, end) {
    
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

//
//for (i in water) {
// 
//    
//    //water[i] = water[i].map(function(x) { return x + 1 });
//    var new_i = i * 1 + 1
//    console.log((new_i) + ': [' + water[i] + ']');
//    
//}
