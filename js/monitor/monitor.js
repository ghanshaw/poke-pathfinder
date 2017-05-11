var Monitor = function(game) {
    
    // Attach game objects
    this.map = game.map;
    this.game = game;
    
    // Size of floor borders
    this.floorborder = {
        rows: 2,
        cols: 2
    };
    
    // Store pointer
    this.pointer = null;
    
    // Store dimensions of each floor
    this.floorDimensions = {
        'F1': {},
        'F2': {},
        'F3': {}
    };
    
    // Store layers, details for each floor
    this.floors = {};
    
    // Canvas objects
    this.screen = {
        background: {},
        foreground: {}
    }
    this.background = {};
    this.foreground = {};
    
    // Bitmap images
    this.rocklayer = {};
    this.transitionlayer = {};
    
    // Z-indeces dictate how layers overlap
    this.zIndex = {
        rocklayer: 5,
        waterlayer: 10,
        floor: {
            background: 15,
            foreground: 25
        },        
        screen: {
            background: 20,
            foreground: 30
        },
        transitionlayer: {
            active: 45,
            inactive: 0
        },
        graphic: {
            background: 35,
            foreground: 40
        }
    };
    
    // Current active waterlayer
    this.currentLayer = 0;

    // Define the order in which floors appear
    this.relativeOrder = [ 'F2', 'F1', 'BF1' ];
    
    // Colors of various canvas elements
    this.colors = {
        rock: '#4CAF50',
        grid: '#96fff4',
        circle: '#FF5722',
        square: "rgba(233, 30, 99, .7)",
        star: '#a472ff'
    };
    
    // Monitor anchors for floor label
    this.anchors = {};
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________INITIALIZATION_________ = function() {};

// Initiaize monitor
Monitor.prototype.init = function() {
  
    this.initRockLayer();
    this.initFloors();
    this.initScreen();

};

// Initialize Rock Layer
Monitor.prototype.initRockLayer = function() {
  
    var game = this.game;
    
    // If rocklayer already exists, attach to DOM
    if (this.rocklayer.img) { 
        this.appendImgToDom(this.rocklayer.img);
        return; 
    }
    
    // Get rocklayer from Map
    var rocklayer = game.getRockLayer();  
    
    // Store rocklayer and relevant information
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    

    // Update css of rocklayer DOM element
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    
    // Add rocklayer to DOM
    this.appendImgToDom(this.rocklayer.img);
};


// Initialize Transition Layer
Monitor.prototype.initTransitionLayer = function() {

    var game = this.game;
    
    // If monitor already has transition layer, attach to DOM
    if (this.transitionlayer.img) { 
        this.appendImgToDom(this.transitionlayer.img);
        return; 
    }
    
    // Get transition layer from map
    var transitionlayer = game.getTransitionLayer();  
    
    //Store transiton layer on monitor object
    this.transitionlayer['img'] = $(transitionlayer.img).clone();
    
    
    // Update css of transition layer
    $(this.transitionlayer.img).addClass('layer');
    $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
    
    // Attach transition layer to DOM
    this.appendImgToDom(this.transitionlayer.img);

};

// Initialize Grid
Monitor.prototype.initGrid = function() {
    
    var game = this.game;
    
    // Create blank canvas, ctx
    var canvasSize = {
        width: this.screen.background.canvas.width,
        height: this.screen.background.canvas.height
    };
   
    this.grid = game.createCanvasCtx(canvasSize);

    // Update grid ctx
    var canvas = this.grid.canvas;
    var ctx = this.grid.ctx;
    ctx.strokeStyle = this.colors.grid;
    
    // Create rows and columns with loops
    for (let r = 0; r <= this.rows; r++) {
     
        ctx.beginPath();
        let y = (r * this.tile_size);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
    };
    
    for (let c = 0; c <= this.cols; c++) {
     
        ctx.beginPath();
        let x = (c * this.tile_size);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
    };
};

// Screen consists of background and foreground canvas
Monitor.prototype.initScreen = function() {
   
    var game = this.game;
    
    var canvasId = 'monitor';
    
    // Define canvas objects
    var canvas;
    var ctx;

    // Get and store foreground canvas in DOM
    canvas = $('.monitor.foreground')[0];
    ctx = canvas.getContext('2d');   
    var foreground = {
        canvas: canvas,
        ctx: ctx
    };
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    // Get and store background canvas in DOM
    canvas = $('.monitor.background')[0];
    ctx = canvas.getContext('2d');   
    var background = {
        canvas: canvas,
        ctx: ctx
    };
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false; 
    
    //////////////////////
    // Get size of monitor
    //////////////////////
    
    // Find max number of cols in a floor
    // Sum of rows in floor
    var floors = game.getFloors();
    var cols = Number.NEGATIVE_INFINITY;
    var rows = 0;
    for (let f in floors) {
        cols = Math.max(floors[f].cols, cols);
        rows += floors[f].rows;
    }
    
    rows += this.floorborder.rows * 4;
    cols += this.floorborder.cols * 2;
    
    this.rows = rows;
    this.cols = cols;
    
    // Update z-index of each frame
    $(foreground.canvas).css('z-index', this.zIndex.screen.foreground);
    $(background.canvas).css('z-index', this.zIndex.screen.background);
    
    foreground.canvas.id = 'foreground';
    background.canvas.id = 'background';
    
    this.screen = {
        foreground: foreground,
        background: background
    };
    
};

// Initialize floors
Monitor.prototype.initFloors = function() {
  
    var game = this.game;
    var mapFloors = game.getFloors();    
   
    // Loop through mapfloors
    for (let f in mapFloors) {
               
        // If corresponding Monitor floor already exists
        if (this.floors[f]) { 
            
            // Append to DOM
            let floor = this.floors[f];
            this.appendImgToDom(floor.background.img);
            this.appendImgToDom(floor.foreground.img);
            
            for (let img of floor.waterlayer.img) {
                this.appendImgToDom(img);
            }
            continue;
        }
        
        // Get map floor
        let mapFloor = mapFloors[f];
        
        // Define floor object
        let floor = {
            width: 0,
            height: 0,
            top: 0,
            left: 0,  
            background: { img: null },
            foreground: { img: null },
            waterlayer: {
                img: []
            }
        };
        
        // Get background and foreground bitmap images from Map
        floor.background.img = $(mapFloor.background.img).clone();
        floor.background.img.css('z-index', this.zIndex.floor.background);
        floor.background.img.addClass('layer');

        
        floor.foreground.img = $(mapFloor.foreground.img).clone(); 
        floor.foreground.img.css('z-index', this.zIndex.floor.foreground);
        floor.foreground.img.addClass('layer');

        // If floor has water
        if (game.floorHasWater(f)) {
        
            // Get waterbitmap  images from Map
            let waterlayer = game.getWaterLayer();
            for (let imgWater of waterlayer.img) {
                
                // Clone each water image, and add to array of waterlayers
                let img = $(imgWater).clone();
                img.addClass('layer');
                img.css('z-index', this.zIndex.waterlayer);
                floor.waterlayer.img.push(img);
            }
            floor.waterlayer.rows = waterlayer.rows;
            floor.waterlayer.cols = waterlayer.cols;           
        };
        
        // Append all the elements to the monitor
        this.appendImgToDom(floor.background.img);
        this.appendImgToDom(floor.foreground.img);
        for (let img of floor.waterlayer.img) {
            this.appendImgToDom(img);
        }
        
        this.floors[f] = floor;       
    };
};

// Append an image to the DOM
Monitor.prototype.appendImgToDom = function(img) {
    $('.monitor.screen').append(img);  
};

//-------------------------------------//
/////////////////////////////////////////
// Resizing
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________RESIZE_METHODS_________ = function() {};

// Resize monitor
Monitor.prototype.resize = function() {
    
    this.resizeScreen();
    this.resizeFloors();
    this.resizeRockLayer();
    
    // These rely on dimensions of screen
    this.initGrid();
    this.initTransitionLayer();
    
};

// Resize screen
Monitor.prototype.resizeScreen = function() {
    
    // Define screen as 90% of its parent
    $('.monitor.screen').css('width', '90%');
    
    
    var monitorScreen = $('.monitor.screen');
    var monitorFrame = $('.monitor-frame');
    
    // Compute tile size (either based on canvas size, or fixed)
    var monitorFrameWidth = monitorFrame.width();
    var monitorScreenWidth = monitorScreen.width();
    
    this.tile_size = Math.floor(monitorFrameWidth / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    //var tile_size = 16;
    var tile_size = this.tile_size;
    
    // Update canvas dimensions
    this.screen.foreground.canvas.width = tile_size * this.cols;
    this.screen.foreground.canvas.height = tile_size * this.rows;
    
    this.screen.background.canvas.width = tile_size * this.cols;
    this.screen.background.canvas.height = tile_size * this.rows;
    
    // Update screen width to auto
    $('.monitor.screen').css('width', 'auto');  
};


// Resize Rock Layer
Monitor.prototype.resizeRockLayer = function() {
    
    // Update width of Rock Layer based on tile size
    var width = this.tile_size * this.rocklayer.cols;   
    $(this.rocklayer.img).css('width', width);
    
};

// Resize floor layers
Monitor.prototype.resizeFloors = function() {
    
    // Get game objects
    var game = this.game;
    var mapFloors = game.getFloors();
    
    // Get tile size
    var tile_size = this.tile_size;
    
    // Height of previous floor (for looping)
    var prev_height = 0;
    
    // For floor in relative order
    for (let f of this.relativeOrder) {
        
        // Get map floor and monitor floor
        let mapFloor = mapFloors[f];
        let floor = this.floors[f];
        
        // Get dimensions of floor
        let rows = mapFloor.rows;
        let cols = mapFloor.cols;
        
        // Get width and height
        let width = cols * tile_size;
        let height = rows * tile_size;

        // Determine top and left of floor
        var offset_top = this.floorborder.rows * this.tile_size + prev_height;
        var max_floor_cols = this.cols - (this.floorborder.cols * 2);
        var offset_left = (max_floor_cols - cols)/2 + this.floorborder.cols;
        offset_left *= this.tile_size;
        
        // Update monitor floor with dimensions
        floor.rows = rows;
        floor.cols = cols;
        
        floor.top = offset_top;
        floor.left = offset_left;
        
        floor.height = height;
        floor.width = width;
        
        // Get and update image objects
        let foreground = floor.foreground;
        let background = floor.background;     
        let waterlayer = floor.waterlayer;
        
        $(foreground.img).css('width', width);
        $(foreground.img).css('top', floor.top);
        $(foreground.img).css('left', floor.left);
        
        $(background.img).css('width', width);
        $(background.img).css('top', floor.top);
        $(background.img).css('left', floor.left);
        
        // Update dimenions of water layer 
        // Water layer is slightly smaller than floor layer to prevent peeking
        let waterWidth = (floor.cols - .5) * this.tile_size;
        let waterHeight = (floor.rows - .5) * this.tile_size;
        
        // Update the css of each water layer
        for (let img of waterlayer.img) {
            $(img).css('width', waterWidth);
            $(img).css('top', floor.top);
            $(img).css('left', floor.left);
        };
        
        // Update floor anchors (top and bottom boundaries of each floor)
        this.anchors[f] = {
            top: prev_height,
            bottom: prev_height + height + (this.floorborder.rows * this.tile_size)
        };
        
        // Store height for next floor
        prev_height += height + (this.floorborder.rows * this.tile_size);
        
    }; 
};


//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________TILE_METHODS_________ = function() {};

// Get top, left offsts from tile
Monitor.prototype.getXYFromTile = function(tile) {
       
    var floorId = tile.floor.id;
    var floor = this.floors[floorId];
    
    var x = tile.col * this.tile_size;
    var y = tile.row * this.tile_size;
    
    x += floor.left;
    y += floor.top;
    
    return {
        x: x,
        y: y
    };
    
};

// Get tile from pointer
Monitor.prototype.getTileFromPointer  = function() {
    
    var pointer = this.pointer;
    
    if (!pointer || pointer.target.id !== 'foreground') {
        return;
    }
    
    // Get pointer top, left
    var top = pointer.y;
    var left = pointer.x;
    
    // Loop through floor
    for (var f in this.floors) {
        let floor = this.floors[f];
        
        // If top, left intersect with floors borders
        if (top > floor.top && 
                top < (floor.top + floor.height) &&
                left > floor.left &&
                left < (floor.left + floor.width)) {
            
            // Computer top and left relative to floor and break
            top -= floor.top;
            left -= floor.left;
            break;
        }
        
    }
    
    // Get tile size
    var tile_size = this.tile_size;
    
    // Use top, left to get row, col
    var col = Math.floor(left / tile_size);
    var row = Math.floor(top / tile_size);
    
    // Get tile
    var tileId = [f, row, col].toString();
    var tile = this.game.getTileFromId(tileId);
    
    return tile;
};


//-------------------------------------//
/////////////////////////////////////////
// Drawing Methods
/////////////////////////////////////////
//-------------------------------------//


Monitor.prototype._________DRAWING_METHODS_________ = function() {};

// Draw, update layers belonging to monitor
Monitor.prototype.drawMonitor = function() {
    
    // Update water layer
    this.updateWaterlayer();

    // Draw grid
    this.drawGrid();

    //Draw transition layer
    this.drawTransitionLayer();
};

// Draw shape to screen
Monitor.prototype.drawShapeToScreen = function(shape, floorId, tile) {

    // Get 
    var dof = tile.dof;
    var tile_size = this.tile_size;    
    var screen = this.screen;
    
    var xy = this.getXYFromTile(tile);
    
    var ctx;
    if (dof === 'BACKGROUND') {
        ctx = screen.background.ctx;
    } else if (dof === 'FOREGROUND') {
        ctx = screen.foreground.ctx;
    }
    
    // If shape is a circle
    if (shape.toUpperCase() === 'CIRCLE') {
        
        // Draw circle 
        
        xy.x += (1/2) * tile_size;
        xy.y += (1/2) * tile_size;
        
        ctx.fillStyle = this.colors.circle;
        ctx.beginPath();
        ctx.arc(xy.x, xy.y, tile_size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    };
    
    // If shape is a square
    if (shape.toUpperCase() === 'SQUARE') {
        ctx.strokeStyle = this.colors.square;
        ctx.lineWidth = tile_size / 10;
        ctx.strokeRect(xy.x, xy.y, tile_size, tile_size);
    };
    
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
    };    
};


// Draw image directly to screen
Monitor.prototype.drawImageToScreen = function(options) {
    
    var game = this.game;
    
    // Function accepts various arguments stored in an options array
    // img, option, floorId, dof, tile, span=1, alpha=1, spriteOptions
    
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
    
    // Draw image onto a tile
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
        
        let ctx;
        if (dof === 'BACKGROUND') {
            ctx = screen.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = screen.foreground.ctx;
        }

        // Update opacity of layer of alpha argument is provided
        if (alpha) {
            ctx.globalAlpha = 1 - alpha;
        }
        
        // Get floor for dimensions
        let floor = this.floors[floorId];
        
        // Draw image to screen
        ctx.drawImage(image, floor.left, floor.top, floor.width, floor.height);
        
        // Restore opacity
        ctx.globalAlpha = 1;
        return;
    }  
};


// Draw transition layer
Monitor.prototype.drawTransitionLayer = function() {
    
    var game = this.game;
    
    // If player is climbing ladder
    if (game.getPlayerState() === 'LADDER') {
        
        // Get opacity of layer from game
        let opacity = game.getTransitionOpacity();
        
        // Update css of transition layer
        $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.active);
        $(this.transitionlayer.img).css('opacity', opacity);
        return;   
    }
    
    // Revert css of transition layer, send to back
    $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
};



// Draw grid
Monitor.prototype.drawGrid = function() {
    
    // If grid is visible
    if (this.game.isGridVisible()) {
        
        // Get screen width and height
        let width = this.screen.foreground.canvas.width;
        let height = this.screen.foreground.canvas.height;
        
        // Draw grid to screen
        this.screen.foreground.ctx.drawImage(this.grid.canvas, 0, 0, width, height);
    }
    
};

// Update water layers based on time
Monitor.prototype.updateWaterlayer = function() {
    
    var game = this.game;
    var ticks = game.getTicks();
    
    var i = Math.floor( (ticks/16) % 8 );  
    
    // After a certain number of ticks
    if (i !== this.currentLayer) {   
        // Loop through floors
        for (let f in this.floors) {
            
            // Get floor
            let floor = this.floors[f];  
            
            // Skip floors without water
            if (floor.waterlayer.img.length === 0) { continue; }
            
            // Update water layer, hiding one layer and exposing another
            floor.waterlayer.img[this.currentLayer].hide(0);
            floor.waterlayer.img[i].show(0);

        }    
        this.currentLayer = i;
    }  
};


// Prepare monitor based on Map state
Monitor.prototype.prepareMonitor = function(state) {
  
    // If Map state is Graphic
    if (state === 'GRAPHIC') {
    
        // Give canvas background color;
        $(this.screen.background.canvas).css('background-color', this.rockGreen);

        // Move screen forward
        $(this.screen.background.canvas).css('z-index', this.zIndex.graphic.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.graphic.foreground);
    
    } 
    // If Map state is Bitmap
    else if (state === 'BITMAP') {
        
        // Remove canvas background color
        $(this.screen.background.canvas).css('background-color', 'transparent');

        // Return images to original z-index
        $(this.screen.background.canvas).css('z-index', this.zIndex.screen.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.screen.foreground);       
    } 
};

// Clear screen
Monitor.prototype.clearScreen = function() {
  
    var screen = this.screen;
    
    // Get width and heigh to screen
    var width = screen.background.canvas.width;
    var height = screen.background.canvas.height;
    
    // Clear screen
    screen.background.ctx.clearRect(0, 0, width, height);
    screen.foreground.ctx.clearRect(0, 0, width, height);
    
};




//
//
//
//
//Monitor.prototype.drawCave = function() {
//     
//    //this.ctx.drawImage(this.background.canvas, 0, 0);
//     
//};
//
//
//Monitor.prototype.createFloorBackgroundLayer = function() {
//    
//    
//       
//    
//    
//    // Get floor map png from html img
////    var imgId = this.floor_data.imgOverlayId();
////    // Return if there is not 3D layer
////    if (!imgId) { return; }
////    var overlay_img = document.getElementById(imgId);
//    
//    
//    
//    
//    // Draw image to canvas
//    //this.ctx.drawImage(img, offset_top, offset_left, width, height);
//    
////    // Attach floorlayer to floor via bitmap object
////    this.bitmap.overlaylayer = {
////        canvas: canvas,
////        ctx: ctx
////    };
//
//};
//
//
//    
//    
//    
//      
////    // Number of rows/cols in frame
////    var frame_rows = rows || 27;
////    var frame_cols = cols || 44;
////    
////    var floor_rows = this.rows;
////    var floor_cols = this.cols;
//    
//
//    
//    // Compute offsets of floor from frame
////    var offset_rows = Math.floor((frame_rows - floor_rows)/2);
////    var offset_cols = Math.floor((frame_cols - floor_cols)/2);
////    
////    var offset_x = offset_cols * tile_size;
////    var offset_y = offset_rows * tile_size;
////
////    this.tile_size = tile_size;
////    
////    // Create frame object to hold canvas, related data;
////    var frame = {};
////    
////    frame.canvas = canvas;
////    frame.ctx = ctx;
////    frame.rows = frame_rows;
////    frame.cols = frame_cols;
////    frame.offset_rows = offset_rows;
////    frame.offset_cols = offset_cols;
////    frame.offset_x = offset_x;
////    frame.offset_y = offset_y;
////    
////    this.frame = frame;
//    
//
//
//Monitor.prototype.changeBorderSize = function(size) {
//    
//};
//
//
//Monitor.prototype.drawMonitor = function() {
//    
//};
//
//

//
//Monitor.prototype.createMonitorBackground = function() {
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
//    canvas.width = this.canvas.width;
//    canvas.height = this.canvas.height;
//    
//    var rows = this.rows;
//    var cols = this.cols;
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
//    var monitorbackground = {
//        canvas: canvas,
//        ctx: ctx
//    };
//    
//    this.monitorbackground = monitorbackground;
//    
////};
//
//Monitor.prototype.drawPlayerDrag = function() {
//    
//    var game = this.game;
//    var tile_size = this.tile_size;
//    
//    if (game.getPlayerState() === 'DRAG') {
//        
//        this.pointer;
//        var sprite = game.getPlayerDragSprite();
//        this.ctx.drawImage(sprite.canvas, this.pointer.x - tile_size, this.pointer.y - tile_size, tile_size * 2, tile_size * 2);
//        
//    } 
//    
////};
//
//Monitor.prototype.drawFloorFrames = function() {
//    
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
//    canvas.width = this.cols * this.tile_size;
//    canvas.height = this.rows * this.tile_size;
//    
//    //this.bitmap['overlaylayer'] = null;
//    
//    var floors = game.getFloors();
//    var floorOffsets = this.floorOffsets;
//    var prev_height = 0;
//    
//    for (let f of this.relativeOrder) {
//        
//        let floor = floors[f];
//        
//        var width = floor.cols * this.tile_size;
//        var height = floor.rows * this.tile_size;
//        
//        var offset_top = this.floorborder.rows * this.tile_size + prev_height;
//        
//        var max_floor_cols = this.cols - (this.floorborder.cols * 2);
//        var offset_left = (max_floor_cols - floor.cols)/2 + this.floorborder.cols;
//        offset_left *= this.tile_size;
//        
//
////        // Update dimensions of floor on monitor
////        this.floorDimensions[f] = {
////            top: offset_top,
////            left: offset_left,
////            height: height,
////            width: width
////        };
//
//        //this.ctx.fillRect(0, 0, 500, 500);
//        
//        this.ctx.drawImage(floor.screen.canvas, offset_left, offset_top, width, height);
//        prev_height += height + (this.floorborder.rows * this.tile_size);
//        
//    };
//    
//};
