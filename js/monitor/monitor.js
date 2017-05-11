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
    this.transitionlayer = {};
    
    this.zIndex = {
        rocklayer: 5,
        waterlayer: 10,
        floor: {
            background: 15,
            foreground: 25
        },        
        frame: {
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
    
    
    this.currentLayer = 0;
    
    
    
    // Define the order in which floors appear
    this.relativeOrder = [ 'F2', 'F1', 'BF1' ];
    
    this.rockGreen = '#4CAF50';
    
    this.anchors = {};
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________INITIALIZATION_________ = function() {};

Monitor.prototype.init = function() {
  
    this.initRockLayer();
    this.initFloors();
    this.initFrame();

};

Monitor.prototype.initRockLayer = function() {
  
    var game = this.game;
    
    if (this.rocklayer.img) { 
        this.appendImgToDom(this.rocklayer.img);
        return; 
    }
    
    var rocklayer = game.getRockLayer();  
    
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    
    var width = this.tile_size * this.rocklayer.cols; 
    
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    this.appendImgToDom(this.rocklayer.img);
    
};


Monitor.prototype.initTransitionLayer = function() {

    var game = this.game;
    
    if (this.transitionlayer.img) { 
        this.appendImgToDom(this.transitionlayer.img);
        return; 
    }
    
    var transitionlayer = game.getTransitionLayer();  
    
    this.transitionlayer['img'] = $(transitionlayer.img).clone();
    
//    var width = this.frame.background; 
//    
//    $(this.rocklayer.img).addClass('layer');
//    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    $(this.transitionlayer.img).addClass('layer');
    $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
    this.appendImgToDom(this.transitionlayer.img);

};


Monitor.prototype.initGrid = function() {

    // Create reusable context
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    
    canvas.width = this.frame.background.canvas.width;
    canvas.height = this.frame.background.canvas.height;
    ctx.strokeStyle = '#96fff4';

    
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

//    this.fillStyle = 'blue';
//    this.ctx.fillRect(0, 0, 700, 1000);

    canvas.id = 'gridCanvas';
    ctx.id = 'gridCanvas';
    
    this.grid = {
        canvas: canvas,
        ctx: ctx
    };

};

// Screen consists of background and foreground canvas
Monitor.prototype.initFrame = function() {
   
    var game = this.game;
    
    var canvasId = 'monitor';
    
    // Define canvas objects
    var canvas;
    var ctx;
    
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
    
    // Update z-index of each frame
    $(foreground.canvas).css('z-index', this.zIndex.frame.foreground);
    $(background.canvas).css('z-index', this.zIndex.frame.background);
    
    foreground.canvas.id = 'foreground';
    background.canvas.id = 'background';
    
    // Append canvas objects to DOM
//    this.appendImgToDom(foreground.canvas);
//    this.appendImgToDom(background.canvas);
    
    this.frame = {
        foreground: foreground,
        background: background
    };
    
};

Monitor.prototype.initFloors = function() {
  
    var game = this.game;
    var mapFloors = game.getFloors();
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    
    var tile_size = this.tile_size;
    
   
    
    for (let f in mapFloors) {
        
        
        
        if (this.floors[f]) { 
            let floor = this.floors[f];
            this.appendImgToDom(floor.background.img);
            this.appendImgToDom(floor.foreground.img);
            
            for (let img of floor.waterlayer.img) {
                this.appendImgToDom(img);
            }
            continue;
        }
        
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
        floor.background.img.css('z-index', this.zIndex.floor.background);
        floor.background.img.addClass('layer');

        
        floor.foreground.img = $(mapFloor.foreground.img).clone(); 
        floor.foreground.img.css('z-index', this.zIndex.floor.foreground);
        floor.foreground.img.addClass('layer');

        
        if (game.floorHasWater(f)) {
        
            let waterlayer = game.getWaterLayer();
            for (let imgWater of waterlayer.img) {
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

        //
        //        this.ctx.drawImage(floor.frame.canvas, offset_left, offset_top, width, height);
        //        prev_height += height + (this.floorborder.rows * this.tile_size);
        
    };
    
    console.log(this.floors);
    
};

//-------------------------------------//
/////////////////////////////////////////
// Resizing
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________RESIZE_METHODS_________ = function() {};

Monitor.prototype.resize = function() {
    
    this.resizeFrame();
    this.resizeFloors();
    this.resizeRockLayer();
    
    // These rely on dimensions of frame
    this.initGrid();
    this.initTransitionLayer();
    
};



Monitor.prototype.resizeRockLayer = function() {
    
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


Monitor.prototype.appendImgToDom = function(img) {

    $('.monitor.screen').append(img);
    
};



Monitor.prototype.resizeFrame = function() {
    
    $('.monitor.screen').css('width', '90%');
    
    var monitorScreen = $('.monitor.screen');
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
    
    this.frame.foreground.canvas.width = tile_size * this.cols;
    this.frame.foreground.canvas.height = tile_size * this.rows;
    
    this.frame.background.canvas.width = tile_size * this.cols;
    this.frame.background.canvas.height = tile_size * this.rows;
    
    $('.monitor.screen').css('width', 'auto');
    
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
        
        
        let waterWidth = (floor.cols - .5) * this.tile_size;
        let waterHeight = (floor.rows - .5) * this.tile_size;
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
        
        this.anchors[f] = {
            top: prev_height,
            bottom: prev_height + height + (this.floorborder.rows * this.tile_size)
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


//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________TILE_METHODS_________ = function() {};

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


Monitor.prototype.getTileFromPointer  = function() {
    
    var pointer = this.pointer;
    
    if (!pointer || pointer.target.id !== 'foreground') {
        return;
    }
    
    var top = pointer.y;
    var left = pointer.x;
    //var floorDimensions =  this.floorDimensions;

    for (var f in this.floors) {
        let floor = this.floors[f];


        
        if (top > floor.top && 
                top < (floor.top + floor.height) &&
                left > floor.left &&
                left < (floor.left + floor.width)) {

            top -= floor.top;
            left -= floor.left;
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

//-------------------------------------//
/////////////////////////////////////////
// Drawing Methods
/////////////////////////////////////////
//-------------------------------------//

Monitor.prototype._________DRAWING_METHODS_________ = function() {};


Monitor.prototype.drawMonitor = function() {
    
    
    
    // Update water layer
    this.updateWaterlayer();
    
    // Draw Floor Frames
    //this.drawFloorFrames();

    // Draw grid
    this.drawGrid();
    
    // Draw player drag icon
    //this.drawPlayerDrag();

    //Draw transition layer
    this.drawTransitionLayer();
};



Monitor.prototype.drawShapeToScreen = function(shape, floorId, tile, color) {


    var dof = tile.dof;
    
    var tile_size = this.tile_size;    
    var frame = this.frame;
    
    var xy = this.getXYFromTile(tile);
    
    var ctx;
    if (dof === 'BACKGROUND') {
        ctx = frame.background.ctx;
    } else if (dof === 'FOREGROUND') {
        ctx = frame.foreground.ctx;
    }
    
    
    if (shape.toUpperCase() === 'CIRCLE') {
        
        xy.x += (1/2) * tile_size;
        xy.y += (1/2) * tile_size;
        
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(xy.x, xy.y, tile_size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    
    if (shape.toUpperCase() === 'SQUARE') {
        //frame.ctx.beginPath();
        ctx.strokeStyle = "rgba(233, 30, 99, .7)";
        ctx.lineWidth = tile_size / 10;
        ctx.strokeRect(xy.x, xy.y, tile_size, tile_size);
    }
    
    if (shape.toUpperCase() === 'STAR') {
        
        ctx.fillStyle = '#a472ff';
        
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



Monitor.prototype.drawImageToFrame = function(options) {
    
    
    //img, option, floorId, dof, tile, span=1, alpha=1
    
    // Draw image at present location of pointer
    if (options.target === 'pointer') {
        
        let span = options.span;
        let image = options.image;
        
        let ctx = this.frame.foreground.ctx;
        let tile_size = this.tile_size;
        let offset = (1 - span)/2;
        ctx.drawImage(image, this.pointer.x - tile_size, this.pointer.y - tile_size, tile_size * span, tile_size * span);
        return;
    }
    
    if (options.target === 'tile') {
        
        var floorId = options.floorId;
        var tile = options.tile;
        var dof = options.dof;
        var image = options.image;
        var span = options.span;
        
        var floor = this.floors[floorId];
        var frame = this.frame;
        
        var xy = this.getXYFromTile(tile);
        
        //var dof = tile.dof;
        var tile_size = this.tile_size;
        
        var offset = (1 - span)/2;
        
        xy.x += offset * tile_size;
        xy.y += offset * tile_size;   
        
        var ctx;
        if (dof === 'BACKGROUND') {
            ctx = frame.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = frame.foreground.ctx;
        }
        
        ctx.drawImage(image, xy.x, xy.y, tile_size * span, tile_size * span);
        return;
    }
    
    if (options.target === 'floor') {
        
        
        var frame = this.frame;
        let alpha = options.alpha;
        
        let floorId = options.floorId;
        let image = options.image;
        let dof = options.dof;
        
        
        var ctx;
        if (dof === 'BACKGROUND') {
            ctx = frame.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = frame.foreground.ctx;
        }
        
        var floor = this.floors[floorId];
        
        if (alpha) {
            console.log(alpha);
            ctx.globalAlpha = 1 - alpha;
        }
        ctx.drawImage(image, floor.left, floor.top, floor.width, floor.height);
        ctx.globalAlpha = 1;

        return;
    }
    
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


Monitor.prototype.drawPlayerDrag = function() {
    
    var game = this.game;
    var tile_size = this.tile_size;
    
    if (game.getPlayerMoveState() === 'DRAG') {
        
        this.pointer;
        var sprite = game.getPlayerDragSprite();
        this.ctx.drawImage(sprite.canvas, this.pointer.x - tile_size, this.pointer.y - tile_size, tile_size * 2, tile_size * 2);
        
    } 
    
};

Monitor.prototype.drawTransitionLayer = function() {
    
    var game = this.game;
    
    if (game.getPlayerMoveState() === 'LADDER') {
        
        let opacity = game.getTransitionOpacity();
        
        $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.active);
        $(this.transitionlayer.img).css('opacity', opacity);
        return;
    
    }
    
    $(this.transitionlayer.img).css('z-index', this.zIndex.transitionlayer.inactive);
};




Monitor.prototype.drawGrid = function() {
    if (this.game.isGridVisible()) {
        let width = this.frame.foreground.canvas.width;
        let height = this.frame.foreground.canvas.height;
        this.frame.foreground.ctx.drawImage(this.grid.canvas, 0, 0, width, height);
    }
};


Monitor.prototype.updateWaterlayer = function() {
    
    var game = this.game;
    
    var ticks = game.getTicks();
    
    let i = Math.floor( (ticks/16) % 8 );  
    
    if (i !== this.currentLayer) {   
        for (let f in this.floors) {

            let floor = this.floors[f];  
            
            // Skip floors without water
            if (floor.waterlayer.img.length === 0) { continue; }
            
            floor.waterlayer.img[this.currentLayer].hide(0);
            floor.waterlayer.img[i].show(0);

        }    
        this.currentLayer = i;
    }
    
};

Monitor.prototype.prepareMonitor = function(state) {
  
    // Draw cave background
//    if (this.game.getMapState() === 'GRAPHIC') {
//        this.frame.background.ctx.fillStyle = this.rockGreen;
//        this.frame.background.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//    }
    
    if (state === 'GRAPHIC') {
    
        // Give canvas background color;
        $(this.frame.background.canvas).css('background-color', this.rockGreen);

        // Move frame forward
        $(this.frame.background.canvas).css('z-index', this.zIndex.graphic.background);
        $(this.frame.foreground.canvas).css('z-index', this.zIndex.graphic.foreground);
    
    } else if (state === 'BITMAP') {
        
        // Remove canvas background color
        $(this.frame.background.canvas).css('background-color', 'transparent');

        // Return images to original z-index
        $(this.frame.background.canvas).css('z-index', this.zIndex.frame.background);
        $(this.frame.foreground.canvas).css('z-index', this.zIndex.frame.foreground);
        
    }
    
    
};


Monitor.prototype.clearScreen = function() {
  
    var frame = this.frame;
    
    var width = frame.background.canvas.width;
    var height = frame.background.canvas.height;
    
    frame.background.ctx.clearRect(0, 0, width, height);
    frame.foreground.ctx.clearRect(0, 0, width, height);
    
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
//};