var Monitor = function(game) {
    
    this.map = game.map;
    this.game = game;
    this.width;
    this.floorborder = {
        rows: 2,
        cols: 2
    };
    
    this.pointer = null;
    
    this.floorDimensions = {
        'F1': {},
        'F2': {},
        'F3': {}
    };
    
    this.floors = {};
    
    this.background = {};
    this.foreground = {};
    this.rocklayer = {};
    
    this.zIndex = {
        rocklayer: 5,
        waterlayer: 10,
        background: 15,        
        foreground: 20,
        canvas: 25
    };
    
    this.currentLayer = 0;
    
    
    
    // Define the order in which floors appear
    this.relativeOrder = [ 'F2', 'F1', 'BF1' ];
    
    this.rockGreen = '#4CAF50';
};

Monitor.prototype.init = function() {
  
    this.initRocklayer();
    this.initFloors();
    this.initCanvas();

};



Monitor.prototype.resizeMonitor = function() {
    
    this.resizeCanvas();
    this.resizeFloors();
    this.resizeRocklayer();
    
};

Monitor.prototype.resizeRocklayer = function() {
    
    var width = this.tile_size * this.rocklayer.cols;   
    $(this.rocklayer.img).css('width', width);
    
    
  
//    var monitorScreen = $('.monitor-screen');
//    var monitorFrame = $('.monitor-frame');
//    
//    // Compute tile size (based on canvas size, or fixed)
//    var monitorFrameWidth = monitorFrame.width();
//    var monitorScreenWidth = monitorScreen.width();
//    this.tile_size = Math.floor(monitorFrameWidth / this.cols);
//    if (this.tile_size % 2 !== 0) {
//        this.tile_size--;
//    }
//    
//    var tile_size = this.tile_size;
//    
//      // Update canvas height
//    this.canvas.width = tile_size * this.cols;
//    this.canvas.height = tile_size * this.rows;
//    
    
};


Monitor.prototype.initRocklayer = function() {
  
    var game = this.game;

    var rocklayer = game.getRocklayer();  
    
    
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    
    var width = this.tile_size * this.rocklayer.cols; 
    
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    $('.monitor-screen').append(this.rocklayer.img);
    
};



Monitor.prototype.initCanvas = function() {
   
   var game = this.game;
    
    var canvasId = 'monitor';
    
    // Define canvas objects
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    // Max number of cols in a floor
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
    
    $(canvas).css('z-index', this.zIndex.canvas);
    
    this.canvas = canvas;
    this.ctx = ctx;
    
    
};



Monitor.prototype.resizeCanvas = function() {
    
    var monitorScreen = $('.monitor-screen');
    var monitorFrame = $('.monitor-frame');
    
    // Compute tile size (based on canvas size, or fixed)
    var monitorFrameWidth = monitorFrame.width();
    var monitorScreenWidth = monitorScreen.width();
    this.tile_size = Math.floor(monitorFrameWidth / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    var tile_size = this.tile_size;
    
      // Update canvas height
    this.canvas.width = tile_size * this.cols;
    this.canvas.height = tile_size * this.rows;
    
    $('monitor-screen').css('width', 'auto');
    
};



Monitor.prototype.initFloors = function() {
  
    var game = this.game;
    var mapFloors = game.getFloors();
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    
    var tile_size = this.tile_size;
    
   
    
    for (let f in mapFloors) {
        
        if (this.floors[f]) { return; }
        
        let mapFloor = mapFloors[f];
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
        
       
        floor.background.img = $(mapFloor.background.img).clone();
        floor.background.img.css('z-index', this.zIndex.background);
        floor.background.img.addClass('layer');

        
        floor.foreground.img = $(mapFloor.foreground.img).clone(); 
        floor.foreground.img.css('z-index', this.zIndex.foreground);
        floor.foreground.img.addClass('layer');

        
        let waterlayer = game.getWaterlayer();
        for (let imgWater of waterlayer.img) {
            let img = $(imgWater).clone();
            img.addClass('layer');
            img.css('z-index', this.zIndex.waterlayer);
            floor.waterlayer.img.push(img);
        }
        floor.waterlayer.rows = waterlayer.rows;
        floor.waterlayer.cols = waterlayer.cols;
        
        // Append all the elements to the monitor
        $('.monitor-screen').append(floor.background.img);
        $('.monitor-screen').append(floor.foreground.img);
        for (let img of floor.waterlayer.img) {
            $('.monitor-screen').append(img);
            
            // Hide each water layer
            //img.hide();
        }

        this.floors[f] = floor;
        

//        $('.monitor-screen').append(img);
//
//        $('.monitor-screen').css('width', 'auto');
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
//        // Update dimensions of floor on monitor
//        this.floorDimensions[f] = {
//            top: offset_top,
//            left: offset_left,
//            height: height,
//            width: width
//        };
//
//        this.ctx.drawImage(floor.frame.canvas, offset_left, offset_top, width, height);
//        prev_height += height + (this.floorborder.rows * this.tile_size);
        
    };
    
    console.log(this.floors);
    
};



Monitor.prototype.resizeFloors = function() {
    
    
    var game = this.game;
    
    //this.bitmap['overlaylayer'] = null;
    
    var mapFloors = game.getFloors();
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    var floors = this.floors;
    var tile_size = this.tile_size;
    
    for (let f of this.relativeOrder) {
        
        let mapFloor = mapFloors[f];
        let floor = this.floors[f];
        
        // Get dimensions of floor
        let rows = mapFloor.rows;
        let cols = mapFloor.cols;
        
        let width = cols * tile_size;
        let height = rows * tile_size;

        // Determine top and left of floor
        var offset_top = this.floorborder.rows * this.tile_size + prev_height;
        
        var max_floor_cols = this.cols - (this.floorborder.cols * 2);
        var offset_left = (max_floor_cols - cols)/2 + this.floorborder.cols;
        offset_left *= this.tile_size;
        
        floor.top = offset_top;
        floor.left = offset_left;
        
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
        
        
        let waterWidth = waterlayer.cols * this.tile_size;
        let waterHeight = waterlayer.rows * this.tile_size;
        let fromTop = 0;
        let fromRight = waterWidth - width;
        let fromBottom = waterHeight - height;
        let fromLeft = 0;
        let clipPath = 'inset(' + fromTop + 'px ' + fromRight + 'px ' + fromBottom + 'px ' + fromLeft + 'px )';
        
        //.clip-path: inset(0px 320px 112px 0px);
        
        // Update the css of each water layer (include clip-path)
        for (let img of waterlayer.img) {
            $(img).css('width', waterWidth);
            $(img).css('top', floor.top);
            $(img).css('left', floor.left);
            $(img).css('clip-path', clipPath);
        };
        
        // Store height for next floor
        prev_height += height + (this.floorborder.rows * this.tile_size);
        
        

//        // Update dimensions of floor on monitor
//        this.floorDimensions[f] = {
//            top: offset_top,
//            left: offset_left,
//            height: height,
//            width: width
//        };

        //this.ctx.drawImage(floor.frame.canvas, offset_left, offset_top, width, height);
        
        
    };
    
};



Monitor.prototype.drawMonitor = function() {
    
    // Draw cave background
    if (this.game.getMapState() === 'GRAPHIC') {
        this.ctx.fillStyle = this.rockGreen;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
        //this.ctx.drawImage(this.monitorbackground.canvas, 0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update water layer
    this.updateWaterlayer();
    
    // Draw Floor Frames
    this.drawFloorFrames();

    // Draw grid
    this.drawGrid();
    
    // Draw player drag icon
    this.drawPlayerDrag();

    //Draw transition layer
    this.drawTransition();
};


Monitor.prototype.drawFloorFrames = function() {
    
    
    var game = this.game;
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.cols * this.tile_size;
    canvas.height = this.rows * this.tile_size;
    
    //this.bitmap['overlaylayer'] = null;
    
    var floors = game.getFloors();
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    
    for (let f of this.relativeOrder) {
        
        let floor = floors[f];
        
        var width = floor.cols * this.tile_size;
        var height = floor.rows * this.tile_size;
        
        var offset_top = this.floorborder.rows * this.tile_size + prev_height;
        
        var max_floor_cols = this.cols - (this.floorborder.cols * 2);
        var offset_left = (max_floor_cols - floor.cols)/2 + this.floorborder.cols;
        offset_left *= this.tile_size;
        

        // Update dimensions of floor on monitor
        this.floorDimensions[f] = {
            top: offset_top,
            left: offset_left,
            height: height,
            width: width
        };

        //this.ctx.fillRect(0, 0, 500, 500);
        
        this.ctx.drawImage(floor.frame.canvas, offset_left, offset_top, width, height);
        prev_height += height + (this.floorborder.rows * this.tile_size);
        
    };
    
};


Monitor.prototype.updateWaterlayer = function() {
    
    var game = this.game;
    
    var ticks = game.getTicks();
    
    let i = Math.floor( (ticks/16) % 8 );  
    
    if (i !== this.currentLayer) {   
        for (let f in this.floors) {

            let floor = this.floors[f];         
            floor.waterlayer.img[this.currentLayer].hide(0);
            floor.waterlayer.img[i].show(0);

        }    
        this.currentLayer = i;
    }
    
};



Monitor.prototype.drawPlayerDrag = function() {
    
    var game = this.game;
    var tile_size = this.tile_size;
    
    if (game.getPlayerMoveState() === 'DRAG') {
        
        this.pointer;
        var sprite = game.getPlayerDragSprite();
        this.ctx.drawImage(sprite.canvas, this.pointer.x - tile_size, this.pointer.y - tile_size, tile_size * 2, tile_size * 2);
        
    } 
    
};

Monitor.prototype.drawTransition = function() {
    
    var game = this.game;
    
    if (game.getPlayerMoveState() === 'LADDER') {
    
        // Get transition layer from the game (from the map)
        var transitionlayer = this.game.getTransitionLayer();

        // Update layer with new shade black (based on current alpha set during interpolation);
        transitionlayer.ctx.clearRect(0, 0, transitionlayer.canvas.width, transitionlayer.canvas.height);
        transitionlayer.ctx.fillStyle = 'black';
        transitionlayer.ctx.fillRect(0, 0, transitionlayer.canvas.width, transitionlayer.canvas.height);

        this.ctx.drawImage(transitionlayer.canvas, 0, 0, this.canvas.width, this.canvas.height);
    
    }
};






Monitor.prototype.createMonitorBackground = function() {
  
    var game = this.game;
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    
    var rows = this.rows;
    var cols = this.cols;
    var tile_size = this.tile_size;
    
    //var tile_rock = document.getElementById('tile-rock');
    
    var rockOptions = {
        TYPE: 'TILE',
        SURFACE: 'ROCK',
        NUM: 0
    };
    
    var rockSprite = game.spritesheet.getSprite(rockOptions);
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
     
            let y = r * tile_size;
            let x = c * tile_size;

            ctx.drawImage(rockSprite.canvas, x, y, tile_size, tile_size);
            
        }
    }
    
    // Attach rocklayer to floor via bitmap object
    var monitorbackground = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.monitorbackground = monitorbackground;
    
};


Monitor.prototype.createGrid = function() {

    // Create reusable context
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    ctx.strokeStyle = 'purple';

    
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

    this.fillStyle = 'blue';
    this.ctx.fillRect(0, 0, 700, 1000);

    canvas.id = 'gridCanvas';
    ctx.id = 'gridCanvas';
    
    this.grid = {
        canvas: canvas,
        ctx: ctx
    };

};


Monitor.prototype.drawGrid = function() {
    
    return;

    var activeLayers = this.game.getMapLayers();

    if (activeLayers.GRID) {
        this.ctx.drawImage(this.grid.canvas, 0, 0);
    }

};



Monitor.prototype.getTileFromPointer  = function() {
    
    var pointer = this.pointer;
    
    if (!pointer || pointer.target.id !== 'monitor') {
        return;
    }
    
    var top = pointer.y;
    var left = pointer.x;
    var floorDimensions =  this.floorDimensions;

    for (var f in floorDimensions) {
        let dimensions = floorDimensions[f];


        
        if (top > dimensions.top && 
            top < (dimensions.top + dimensions.height) &&
            left > dimensions.left &&
            left < (dimensions.left + dimensions.width)) {

            top -= dimensions.top;
            left -= dimensions.left;
            break;
        }

    }

    var tile_size = this.tile_size;

    var col = Math.floor(left / tile_size);
    var row = Math.floor(top / tile_size);
    
    // Get tile
    var tileId = [f, row, col].toString();
    var tile = this.game.getTileFromId(tileId);
    
    return tile;
    
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
