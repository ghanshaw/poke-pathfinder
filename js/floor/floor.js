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