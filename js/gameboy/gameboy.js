var Gameboy = function(game) {
    
    // Get game object
    this.game = game;
    
    // Define rows and cols
    this.rows = 10;
    this.cols = 15;
    
    // Colors of various canvas elements
    this.colors = {
        rock: '#4CAF50',
        grid: '#96fff4',
        circle: '#FF5722',
        square: "rgba(233, 30, 99, .7)",
        star: '#a472ff'
    };
   
    // Store layers, details for each floor
    this.floors = {};
    
    // bitmap image objects
    this.background = {};
    this.foreground = {};
    this.rocklayer = {};
    this.transitionlayer = {};
    this.waterlayer = {
        img: []
    };
    
    // Canvas objects
    this.screen = {
        background: null,
        foreground: null
    };
    
    // Z-indeces dictate how layers overlap
    this.zIndex = {
        rocklayer: 5,
        waterlayer: 10,
        floor: {
            background: 15,
            foreground: 25
        },        
        screen: {
            bitmap: {
                background: 20,
                foreground: 30
            },
            graphic: {
                background: 35,
                foreground: 40
            }
        },
        transitionlayer: {
            active: 45,
            inactive: 0
        } 
    };
    
    // Current active waterlayer
    this.currentLayer = 0;

};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Gameboy.prototype._________INITIALIZATION_________ = function() {};


// Initialize Gameboy
Gameboy.prototype.init = function() {
    
    this.initScreen();
    this.initRocklayer();   
    this.initWaterlayer();
    this.initFloors();
    
};

// Screen consists of background and foreground canvas
Gameboy.prototype.initScreen = function() {
   
    var game = this.game;
    
    // Define canvas objects
    var canvas;
    var ctx;

    // Get and store DOM foreground canvas
    canvas = $('.gameboy.foreground')[0];
    ctx = canvas.getContext('2d');   
    var foreground = {
        canvas: canvas,
        ctx: ctx
    };
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;   
    
    // Get and store DOM background canvas
    canvas = $('.gameboy.background')[0];
    ctx = canvas.getContext('2d');   
    var background = {
        canvas: canvas,
        ctx: ctx
    };
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    

    // Update z-index of each canvas layer
    $(foreground.canvas).css('z-index', this.zIndex.screen.bitmap.foreground);
    $(background.canvas).css('z-index', this.zIndex.screen.bitmap.background);
    
    this.screen = {
        foreground: foreground,
        background: background
    };
    
};

// Initialize the Rock Layer
Gameboy.prototype.initRocklayer = function() {
  
    // If rocklayer already exists, attach to DOM
    if (this.rocklayer.img) { 
        this.appendImgToDom(this.rocklayer.img);
        return; 
    }
    
    var game = this.game;

    // Get Rock Layer from map
    var rocklayer = game.getRockLayer();  
   
    // Store rocklayer and relevant information
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    
    // Update CSS of rocklayer and attach to DOM
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    $('.gameboy.screen').append(this.rocklayer.img);
    
};

// Initialize the Water Layer
Gameboy.prototype.initWaterlayer = function() {
    
    
    var game = this.game;
    
    // Get water layer, if not already attached to object
    if (this.waterlayer.img.length === 0) { 
        
        // Get water layers from Map
        var waterlayer = game.getWaterLayer();
        
        // Loop through water layers
        for (let imgWater of waterlayer.img) {
            
            // Clone Dom elements
            let img = $(imgWater).clone();
            
            // Update css and append to waterlayer array
            img.addClass('layer');
            img.css('z-index', this.zIndex.waterlayer);
            this.waterlayer.img.push(img);
        }
        this.waterlayer.rows = waterlayer.rows;
        this.waterlayer.cols = waterlayer.cols;
        
    }
    
    // Append waterlays to DOM
    for (let img of this.waterlayer.img) {
        this.appendImgToDom(img);
    }
};

// Initialize Floor Layers
Gameboy.prototype.initFloors = function() {
    
    var game = this.game;
    var mapFloors = game.getFloors();
    
    
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    
    var tile_size = this.tile_size;
    
    
    // Loop through map floors
    for (let f in mapFloors) {
        
        // Attach image objects to DOM if they already exist
        if (this.floors[f]) { 
            let floor = this.floors[f];
            this.appendImgToDom(floor.foreground.img);
            this.appendImgToDom(floor.background.img);
            continue;
        }
        
        // Get map floor
        let mapFloor = mapFloors[f];
        
        // Create Gameboy floor object
        let floor = {
            width: 0,
            height: 0,
            top: 0,
            left: 0,  
            background: { img: null },
            foreground: { img: null },
            waterlayer: {
                img: []
            },
            rows: 0,
            cols: 0
        };
        
        // Get dimensions of floor
        floor.rows = mapFloor.rows;
        floor.cols = mapFloor.cols;
        
        
        // Clone and attach bitmap objects to Gameboy floor
        floor.background.img = $(mapFloor.background.img).clone();
        floor.background.img.css('z-index', this.zIndex.floor.background);
        floor.background.img.addClass('layer');
        floor.background.img.hide(0);
        
        
        floor.foreground.img = $(mapFloor.foreground.img).clone(); 
        floor.foreground.img.css('z-index', this.zIndex.floor.foreground);
        floor.foreground.img.addClass('layer');
        floor.foreground.img.hide(0);
        
        // Append all the elements to the monitor
        $('.gameboy.screen').append(floor.background.img);
        $('.gameboy.screen').append(floor.foreground.img);
               
        this.floors[f] = floor;
        
    };
    
    // Arbitrarily activate one of the floors
    this.activeFloor = 'F1';
    this.floors['F1'].background.img.show(0);
    this.floors['F1'].foreground.img.show(0);
    
};

// Initialize Grid
Gameboy.prototype.initGrid = function() {
    
    var game = this.game;
    
    // Create blank canvas, ctx
    var canvasSize = {
        width: this.screen.width + this.tile_size,
        height: this.screen.height + this.tile_size
    };
   
    this.grid = game.createCanvasCtx(canvasSize);
    
    // Get canvas/ctx objects
    var ctx = this.grid.ctx;
    var canvas = this.grid.canvas;

    // Draw grid
    ctx.strokeStyle = this.colors.grid;
    for (let r = 0; r <= this.rows + 1; r++) {
     
        ctx.beginPath();
        let y = (r * this.tile_size);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
    };
    
    for (let c = 0; c <= this.cols + 1; c++) {
     
        ctx.beginPath();
        let x = (c * this.tile_size);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
    };
};


// Initialize Transition Layer
Gameboy.prototype.initTransitionLayer = function() {
    
    var game = this.game;
    
    // If transition layer exists, append to DOM
    if (!this.transitionlayer.img) { 
        
        // Get transition layer from Map
        var transitionlayer = game.getTransitionLayer();  
        
        // Clone and update css
        this.transitionlayer['img'] = $(transitionlayer.img).clone();
        $(this.transitionlayer.img).addClass('layer');
        $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
    }
    
    // Attach to Monitor object
    this.appendImgToDom(this.transitionlayer.img);
    
};

// Append image to DOM
Gameboy.prototype.appendImgToDom = function(img) {
    $('.gameboy.screen').append(img);
};


//-------------------------------------//
/////////////////////////////////////////
// Resize
/////////////////////////////////////////
//-------------------------------------//

Gameboy.prototype._________RESIZE_METHODS_________ = function() {};

// Resize Gameboy
Gameboy.prototype.resize = function() {
    
    this.resizeScreen();
    this.resizeRocklayer();
    this.resizeFloors();
    this.resizeWaterlayer();
       
    // Must be done after reisizing
    this.initGrid();
    this.initTransitionLayer();
};

// Resize screen
Gameboy.prototype.resizeScreen = function() {
    
    // Define screen as 90% of its parent
    $('.gameboy.screen').css('width', '90%');
    
    // Compute tile size (based on canvas size, or fixed)
    var gameboyScreen = $('.gameboy.screen');
    var gameboyScreenWidth = gameboyScreen.width();
    this.tile_size = Math.floor(gameboyScreenWidth / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    var tile_size = this.tile_size;
    
    // Update canvas width and height (foreground and backround)
    this.screen.width = this.screen.foreground.canvas.width = tile_size * this.cols;
    this.screen.height = this.screen.foreground.canvas.height = tile_size * this.rows;
    
    this.screen.background.canvas.width = tile_size * this.cols;
    this.screen.background.canvas.height = tile_size * this.rows;
    
    // Revert gameboy screen width
    $('.gameboy.screen').css('width', 'auto');
    
};

// Resize Rock Layer
Gameboy.prototype.resizeRocklayer = function() {
  
    // Update width of Rock Layer based on tile size
    var width = this.tile_size * this.rocklayer.cols;   
    $(this.rocklayer.img).css('width', width);
    
};

// Resize water layers
Gameboy.prototype.resizeWaterlayer = function() {
  
    // Make water layer slighly smaller than full size to prevent peeking
    var width = this.tile_size * (this.waterlayer.cols - .5);
    
    // Loop through water layers, updating widths
    for (let img of this.waterlayer.img) {
        img.css('width', width);
    };
    
};

// Resize bitmap floor images
Gameboy.prototype.resizeFloors = function() {
  
    var floors = this.floors;
    
    // Loop through floors
    for (let f in floors) {
        
        let floor = this.floors[f];
        
        // Get foreground and background
        let foreground = floor.foreground;
        let background = floor.background;
        
        // Get updated dimensions
        let width = floor.cols * this.tile_size;
        let height = floor.rows * this.tile_size;
    
        // Update css
        $(foreground.img).css('width', width);
        $(background.img).css('width', width);       
    }
};

//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//

Gameboy.prototype._________TILE_METHODS_________ = function() {};


// Get x, y coordinates on Gameboy from tile
Gameboy.prototype.getXYFromTile = function(tile) {
    
    var pTile = this.game.getPlayerCurrentTile();
    
    // Return if tile and player tile are on different floors
    // (gameboy cannot show tiles from two different floors)
    if (tile.floor.id !== pTile.floor.id) { return null; };
    
    // Get 'origin' of gameboy w.r.t. player tile
    var origin = this.getOrigin(pTile);
    
    // Subtract origin from tile
    var row = tile.row - origin.row;
    var col = tile.col - origin.col;
    
    // Turn tile into x, y
    var x = col * this.tile_size;
    var y = row * this.tile_size;
    
    return {
        x: x,
        y: y
    };
};

// Get 'origin' in relation to tile
// Origin is defined as upper left corner of Gameboy
Gameboy.prototype.getOrigin = function(tile) {
    
    /* 
     * Often useful to define origin of Gameboy in relation to player tile 
     * (center of Gameboy view)
     */
    
    var origin = {
        row: tile.row - (this.rows - 1)/2,
        col: tile.col - (this.cols - 1)/2
    };
    
    return origin;  

};

//-------------------------------------//
/////////////////////////////////////////
// Drawing Methods
/////////////////////////////////////////
//-------------------------------------//

Gameboy.prototype._________DRAWING_METHODS_________ = function() {};

// Draw gameboy
Gameboy.prototype.drawGameboy = function() {  
    
    //if (!this.canvas) { return; }
    
    var game = this.game;
    
    // Define 'camera'
    var camera = {};
    var c = camera;

    // Get camera offset used by various drawing methods
    var pTile = game.getPlayerCurrentTile();
    
    // Get floor id
    c.floorId = pTile.floor.id;
    
    // Get offset of camera from integer row or column
    // Useful during interpolation, when player is between interger row or interger column
    c.offset_top = (pTile.row + .5) % 1;
    c.offset_left = pTile.col % 1;
    
    c.offset_top *= this.tile_size;
    c.offset_left *= this.tile_size;
    
    // Get width and height of screen
    c.width = this.screen.width;
    c.height = this.screen.height;  
   
    // Origin is the top, left corner of the gameboy
    var origin = this.getOrigin(pTile);
    
    // Get sX and sY values for drawImage operation
    c.sX = origin.col * this.tile_size;
    c.sY = origin.row * this.tile_size; 
    
    this.drawRocklayer(camera);
    this.drawWaterlayer(camera);
    this.drawFloor(camera);  
    this.drawGrid(camera);
    this.drawTransitionLayer();
    
};

// Draw shape to screen
Gameboy.prototype.drawShapeToScreen = function(shape, floorId, tile) {

    // Get dof and tile_Size
    var dof = tile.dof;
    var tile_size = this.tile_size;    
    var screen = this.screen;
    
    // Get x,y values of tile w.r.y. gameboy camera
    var xy = this.getXYFromTile(tile);
    
    // Ignore request if shape is on different floor
    if (!xy) {
        return;
    }
    
    // Get context based on depth-of-field
    var ctx;
    if (dof === 'BACKGROUND') {
        ctx = screen.background.ctx;
    } else if (dof === 'FOREGROUND') {
        ctx = screen.foreground.ctx;
    }
    
    // If shape is a circle
    if (shape.toUpperCase() === 'CIRCLE') {
        
        xy.x += (1/2) * tile_size;
        xy.y += (1/2) * tile_size;
        
        ctx.fillStyle = this.colors.circle;
        ctx.beginPath();
        ctx.arc(xy.x, xy.y, tile_size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    
    // If shape is a square
    if (shape.toUpperCase() === 'SQUARE') {
        //frame.ctx.beginPath();
        ctx.strokeStyle = this.colors.square;
        ctx.lineWidth = tile_size / 10;
        ctx.strokeRect(xy.x, xy.y, tile_size, tile_size);
    }
    
    // If shape is a star
    if (shape.toUpperCase() === 'STAR') {
        
        ctx.fillStyle = this.colors.star;
        
        let radius = tile_size / 2.5;
        let points = 5;
        let m = .5;
        
        xy.x += (1/2) * tile_size;
        xy.y += (1/2) * tile_size;
        
        ctx.save();
        ctx.beginPath();
        ctx.translate(xy.x, xy.y);
        ctx.moveTo(0, 0 - radius);
        for (var i = 0; i < points; i++)
        {
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - (radius *  m));
            ctx.rotate(Math.PI / points);
            ctx.lineTo(0, 0 - radius);
        }
        ctx.fill();
        ctx.restore();   
    }
};

// Draw image to screen
Gameboy.prototype.drawImageToScreen = function(options) {
    
    // Function accepts various arguments stored in an options array
    // img, option, floorId, dof, tile, span=1, alpha=1, spriteOptions
    
    var game = this.game;
    
    // Draw image at present location of pointer
    if (options.target === 'pointer') {

        let image = options.image;
        let span = options.span;
                
        let sX;
        let sY;
        let sWidth;
        let sHeight;
               
        // If image is 'spritesheet', get image object from spritesheet
        // using sprite options
        if (image === 'spritesheet') {
            
            let spriteOptions = options.spriteOptions;
            let sXsY = game.getSpriteSheetXY(spriteOptions);
            let sheetCanvas = game.getSpriteSheetCanvas();
            let sprite_size = game.getSpriteSize();
            
            sX = sXsY.x;
            sY = sXsY.y;
            
            sWidth = sprite_size;
            sHeight = sprite_size;
            
            image = sheetCanvas;
        } 
        
        // Source dimentions are just dimentions of image
        else {
            
            sX = 0;
            sY = 0;

            sWidth = image.width;
            Height = image.height;
        }
        
        let tile_size = this.tile_size;
        let offset = (1 - span)/2;
        
        // Compute destination dimensions
        let dX = this.pointer.x - tile_size;
        let dY = this.pointer.y - tile_size;
        let dWidth = tile_size * span;
        let dHeight = tile_size * span;
        
        // Draw diretion to foreground
        let ctx = this.screen.foreground.ctx;

        ctx.drawImage(image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
        return;
    }
    
    if (options.target === 'tile') {       
        
        // Get various variables from arguments object
        let image = options.image;
        let tile = options.tile;
        let floorId = options.floorId;
        let dof = options.dof;
        let span = options.span;
        let floor = this.floors[floorId];
        
        
        // Compute destination dimensions
        let tile_size = this.tile_size;
        let offset = (1 - span)/2;
        
        let xy = this.getXYFromTile(tile);
        
        // Tiles are not on the same floor
        if (!xy) { return; }
        
        let dX = xy.x + (offset * tile_size);
        let dY = xy.y + (offset * tile_size);  
        
        let dWidth = tile_size * span;
        let dHeight = tile_size * span;
        
        let screen = this.screen;
        
        // Get context based on depth-of-field
        let ctx;
        if (dof === 'BACKGROUND') {
            ctx = screen.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = screen.foreground.ctx;
        }
        
        // Compute source dimensions       
        let sX;
        let sY;       
        let sWidth;
        let sHeight;
        
        if (image === 'spritesheet') {
            
            // Get image from spritesheet
            let spriteOptions = options.spriteOptions;
            let sXsY = game.getSpriteSheetXY(spriteOptions);
            let sheetCanvas = game.getSpriteSheetCanvas();
            let sprite_size = game.getSpriteSize();
            
            sX = sXsY.x;
            sY = sXsY.y;
            
            sWidth = sprite_size;
            sHeight = sprite_size;
            
            image = sheetCanvas;
        } else {
            
            sX = 0;
            sY = 0;
            
            sWidth = image.width;
            sHeight = image.height;
        }
        
        // Draw image to screen
        ctx.drawImage(image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
       
        return;
    }
    
    
    if (options.target === 'floor') {
        
        // Get various variables from options argument object
        let alpha = options.alpha;      
        let floorId = options.floorId;
        let image = options.image;
        let dof = options.dof;
              
        let screen = this.screen;
        let pTile = game.getPlayerCurrentTile();
        
        // Ignore draw request if floors are different;
        if (floorId !== pTile.floor.id) { return; }
               
        // Get context based on depth-of-field        
        let ctx;
        if (dof === 'BACKGROUND') {
            ctx = screen.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = screen.foreground.ctx;
        }

        // Get subrectangle dimensions
        var floor = this.floors[floorId];
        var source_tile_size = image.width / floor.cols;
        
        // Get source row and column
        let origin = this.getOrigin(pTile);
        let sRow = origin.row;
        let sCol = origin.col;
        
        // Source width and height is size of gameboy screen
        let sWidth = this.cols;
        let sHeight = this.rows;
        
        // Destination width and height is size of gameboy screen
        let dWidth = this.cols;
        let dHeight = this.rows;
        
        // Destination coordinates are the upper left corner of gboy screen
        let dRow = 0;
        let dCol = 0;
        
        // If source does not completely fill destination area,
        // then adjust source and destination dimensions accordingly
        
        // Space to right
         if ((sCol + sWidth) > floor.cols) {
            sWidth = floor.cols - sCol;
            dWidth = sWidth;
        } 
        // Space to left
        else if (sCol < 0) {
            sWidth = this.cols + sCol;
            dWidth = sWidth;
            dCol = dCol - sCol;
            sCol = 0;
        }
        
         if ((sRow + sWidth) > floor.rows) {
            sHeight = floor.rows - sRow;
            dHeight = sHeight;
        } else if (sRow < 0) {
            sHeight = this.rows + sRow;
            dHeight = sHeight;
            dRow = dRow - sRow;
            sRow = 0;
        }
        
        // Get source and destination dimentions using tile size
        let sX = sCol * source_tile_size;
        let sY = sRow * source_tile_size;
        
        sWidth *= source_tile_size;
        sHeight *= source_tile_size;
        
        dWidth *= this.tile_size;
        dHeight *= this.tile_size;
        
        let dX = dCol * this.tile_size;
        let dY = dRow * this.tile_size; 
        
        // Update opacity of layer of alpha argument is provided
        if (alpha) {
            ctx.globalAlpha = 1 - alpha;
        }
        
        ctx.drawImage(image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
        ctx.globalAlpha = 1;
           
        return;
    } 
};

// Draw Rock Layer
Gameboy.prototype.drawRocklayer = function(camera) {
    
    var game = this.game;

    // Reposition rock layer based on camera offset
    this.rocklayer.img.css('top', -camera.offset_top);
    this.rocklayer.img.css('left', -camera.offset_left);
  
};

// Draw Water Layers
Gameboy.prototype.drawWaterlayer = function(camera) {
    
    this.updateWaterlayer();
    
    // Get the current water way based on currentLayer index
    var img = this.waterlayer.img[this.currentLayer];
    
    // If presentfloor does not have water, hide water
    if (!this.game.floorHasWater(camera.floorId)) { 
        img.hide(0);
        return;
    } 

    // Otherwise show water
    img.show(0);

    // Reposition water layer based on camera
    img.css('top', -camera.sY);
    img.css('left', -camera.sX);
    
};


Gameboy.prototype.drawFloor = function(camera) {
    
   
    // Get background and foreground of present floor
    var f = camera.floorId;
    var background = this.floors[f].background;
    var foreground = this.floors[f].foreground;
    
    // Reposition based on camera dimensions
    background.img.css('top', -camera.sY);
    background.img.css('left', -camera.sX);
    
    foreground.img.css('top', -camera.sY);
    foreground.img.css('left', -camera.sX);
    

    // If floor has changed
    if (this.activeFloor !== f) {
        
        // Hide all the floors
        for (let floorId in this.floors) {
            let floor = this.floors[floorId];
            floor.background.img.hide(0);
            floor.foreground.img.hide(0);
        }
        
        // Show the correct floor
        let floor = this.floors[f];
        floor.background.img.show(0);
        floor.foreground.img.show(0);    
        
        this.activeFloor = f;
    };
};

// Draw transition layer
Gameboy.prototype.drawTransitionLayer = function() {
    
    var game = this.game;
    
    // If player is climbing ladder
    if (game.getPlayerState() === 'LADDER') {
        
        // Get opacity of transion layer from game
        let opacity = game.getTransitionOpacity();
        
        // Update z-index and opacity of transition DOM element
        $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.active);
        $(this.transitionlayer.img).css('opacity', opacity);
        return;
    
    }
    
    // Move transition layer to back
    $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
};

// Draw grid
Gameboy.prototype.drawGrid = function(camera) {
    
    // If grid is visible
    if (this.game.isGridVisible()) {
        
        // Get width and height from camera
        let width = camera.width;
        let height = camera.height;
        
        // Draw grid to foreground, offset as necessary
        this.screen.foreground.ctx.drawImage(this.grid.canvas, camera.offset_left, camera.offset_top, width, height, 0, 0, width, height);
    }
};

// Prepare Gameboy based on Map state
Gameboy.prototype.prepareGameboy = function(state) {
  
    // If Map state is 'GRAPHIC'
    if (state === 'GRAPHIC') {
    
        // Give canvas background color;
        $(this.screen.background.canvas).css('background-color', this.colors.rock);

        // Move screen forward
        $(this.screen.background.canvas).css('z-index', this.zIndex.screen.graphic.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.screen.graphic.foreground);
    
    } 
    // If Map state is 'BITMAP'
    else if (state === 'BITMAP') {
        
        // Remove canvas background color
        $(this.screen.background.canvas).css('background-color', 'transparent');

        // Return images to original z-index
        $(this.screen.background.canvas).css('z-index', this.zIndex.screen.bitmap.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.screen.bitmap.foreground);
        
    }
};


// Clear screen
Gameboy.prototype.clearScreen = function() {
    
    var screen = this.screen;
    
    // Get width and heigh of canvas objects
    var width = screen.background.canvas.width;
    var height = screen.background.canvas.height;
    
    // Clear screen canvas objects
    screen.background.ctx.clearRect(0, 0, width, height);
    screen.foreground.ctx.clearRect(0, 0, width, height);
    
};

// Update waterlayer
Gameboy.prototype.updateWaterlayer = function() {
    
    var game = this.game;
    
    // Count ticks
    var ticks = game.getTicks();   
    var i = Math.floor( (ticks/16) % 8 );  
    
    // After a certain number of ticks
    if (i !== this.currentLayer) {   
        
        // Hide the visible water layer
        var img = this.waterlayer.img;
        img[this.currentLayer].hide(0);
        
        // Show the next waterlayer
        img[i].show(0);
        this.currentLayer = i;       
    }
};