var Gameboy = function(game) {
    
    this.game = game;
    this.rows = 10;
    this.cols = 15;
    
    this.rockGreen = '#4CAF50';
    
    this.floors = {};
    
    this.background = {};
    this.foreground = {};
    this.rocklayer = {};
    this.waterlayer = {
        img: [],
    };
    this.screen = {
        background: null,
        foreground: null
    };
    
    this.zIndex = {
        rocklayer: 5,
        waterlayer: 10,
        background: 15,        
        foreground: 20,
        canvas: 25
    };
    
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
        transition: {
            active: 45,
            inactive: 0
        }
    };
    
    this.currentLayer = 0;
    
    
    
    
    // Define the order in which floors appear
    this.relativeOrder = [ 'F2', 'F1', 'BF1' ];
    
    this.rockGreen = '#4CAF50';
    
    
};

Gameboy.prototype.init = function() {
    
    this.initScreen();
    this.initRocklayer();
    this.initFloors();
    this.initWaterlayer();
    
};

Gameboy.prototype.resize = function() {
    
    this.resizeScreen();
    this.resizeRocklayer();
    this.resizeFloors();
    this.resizeWaterlayer();
    
    console.log(this);
};


Gameboy.prototype.appendImgToDom = function(img) {
    $('.gameboy.screen').append(img);
};

Gameboy.prototype.prepareGameboy = function(state) {
  
    // Draw cave background
//    if (this.game.getMapState() === 'GRAPHIC') {
//        this.frame.background.ctx.fillStyle = this.rockGreen;
//        this.frame.background.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//    }
    
    if (state === 'GRAPHIC') {
    
        // Give canvas background color;
        $(this.screen.background.canvas).css('background-color', this.rockGreen);

        // Move frame forward
        $(this.screen.background.canvas).css('z-index', this.zIndex.screen.graphic.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.screen.graphic.foreground);
    
    } else if (state === 'BITMAP') {
        
        // Remove canvas background color
        $(this.screen.background.canvas).css('background-color', 'transparent');

        // Return images to original z-index
        $(this.screen.background.canvas).css('z-index', this.zIndex.screen.bitmap.background);
        $(this.screen.foreground.canvas).css('z-index', this.zIndex.screen.bitmap.foreground);
        
    }
    
};


// Screen consists of background and foreground canvas
Gameboy.prototype.initScreen = function() {
   
    var game = this.game;
    
    // Objects already exist
//    if (this.screen.background && this.screen.foreground) { return; }
    
    //var canvasId = 'monitor';
    
    // Define canvas objects
    var canvas;
    var ctx;

    
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


Gameboy.prototype.initRocklayer = function() {
  
    // Skip if layer has already been initialized
//    if (this.rocklayer.img) { return; }
  
    var game = this.game;

    var rocklayer = game.getRocklayer();  
   
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    
    var width = this.tile_size * this.rocklayer.cols; 
    
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    $('.gameboy.screen').append(this.rocklayer.img);
    
};

Gameboy.prototype.initWaterlayer = function() {
    
    // Skip if layers have already been initalized
//    if (this.waterlayer.img.length > 0) { return; }
    
    var game = this.game;
    var waterlayer = game.getWaterlayer();
    
    // Create waterlayers, if they do not yet exist
    if (this.waterlayer.img.length === 0) {
    
        for (let imgWater of waterlayer.img) {
            let img = $(imgWater).clone();
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


Gameboy.prototype.initFloors = function() {
  
    var game = this.game;
    var mapFloors = game.getFloors();
    var floorOffsets = this.floorOffsets;
    var prev_height = 0;
    
    var tile_size = this.tile_size;
    
   
    
    for (let f in mapFloors) {
        
        if (this.floors[f]) { 
            let floor = this.floors[f];
            this.appendImgToDom(floor.foreground.img);
            this.appendImgToDom(floor.background.img);
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
            },
            rows: 0,
            cols: 0
        };
        
        floor.rows = mapFloor.rows;
        floor.cols = mapFloor.cols;
       
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
    
    // Activate one of the floors
    this.activeFloor = 'F1';
    this.floors['F1'].background.img.show(0);
    this.floors['F1'].foreground.img.show(0);

    
};


Gameboy.prototype.resizeScreen = function() {
    
    $('.gameboy.screen').css('width', '90%');
    
    var gameboyScreen = $('.gameboy.screen');
    //var monitorFrame = $('.screen-border');
    
    // Compute tile size (based on canvas size, or fixed)
    var gameboyScreenWidth = gameboyScreen.width();
    this.tile_size = Math.floor(gameboyScreenWidth / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    var tile_size = this.tile_size;
    
    // Update canvas height   
    this.screen.width= this.screen.foreground.canvas.width = tile_size * this.cols;
    this.screen.height = this.screen.foreground.canvas.height = tile_size * this.rows;
    
    this.screen.background.canvas.width = tile_size * this.cols;
    this.screen.background.canvas.height = tile_size * this.rows;
    
    $('.gameboy.screen').css('width', 'auto');
    
};


Gameboy.prototype.resizeRocklayer = function() {
  
    var width = this.tile_size * this.rocklayer.cols;   
    $(this.rocklayer.img).css('width', width);
    
};

Gameboy.prototype.resizeWaterlayer = function() {
  
    var width = this.tile_size * this.waterlayer.cols;
    
    for (let img of this.waterlayer.img) {
        img.css('width', width);
        img.css('display', 'none');
    };
    
};

Gameboy.prototype.resizeFloors = function() {
  
    var floors = this.floors;
    
    for (let f in floors) {
        
        let floor = this.floors[f];
        
        var foreground = floor.foreground;
        var background = floor.background;
        
        var width = floor.cols * this.tile_size;
        var height = floor.rows * this.tile_size;
    
        $(foreground.img).css('width', width);
        $(background.img).css('width', width);
        
    }
    
};





Gameboy.prototype.clearScreen = function() {
    
     var screen = this.screen;
    
    var width = screen.background.canvas.width;
    var height = screen.background.canvas.height;
    
    screen.background.ctx.clearRect(0, 0, width, height);
    screen.foreground.ctx.clearRect(0, 0, width, height);
    
};


Gameboy.prototype.drawShapeToScreen = function(shape, floorId, tile, color) {


    var dof = tile.dof;
    
    var tile_size = this.tile_size;    
    var screen = this.screen;
    
    var xy = this.getXYFromTile(tile);
    
    // Ignore request if shape is on difference floor
    if (!xy) {
        return;
    }
    
    var ctx;
    if (dof === 'BACKGROUND') {
        ctx = screen.background.ctx;
    } else if (dof === 'FOREGROUND') {
        ctx = screen.foreground.ctx;
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



Gameboy.prototype.drawImageToScreen = function(img, options) {
    
    //img, option (location), floorId, dof, tile, span=1, alpha=1
    var game = this.game;
    
    // Draw image at present location of pointer
    if (options.location === 'pointer') {
        let ctx = this.frame.foreground.ctx;
        let tile_size = this.tile_size;
        let offset = (1 - span)/2;
        ctx.drawImage(img, this.pointer.x - tile_size, this.pointer.y - tile_size, tile_size * span, tile_size * span);
        return;
    }
    
    if (options.location === 'tile') {
        
        let floorId = options.floorId;
        let tile = options.tile;
        let span = options.span;
        let dof = options.dof;
        
        
        var floor = this.floors[floorId];
        var screen = this.screen;
        
        var xy = this.getXYFromTile(tile);
        
        // Tiles are not on the same floor
        if (!xy) { return; }
        
        //var dof = tile.dof;
        var tile_size = this.tile_size;
        
        var offset = (1 - span)/2;
        
        xy.x += offset * tile_size;
        xy.y += offset * tile_size;   
        
        var ctx;
        if (dof === 'BACKGROUND') {
            ctx = screen.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = screen.foreground.ctx;
        }
        
        ctx.drawImage(img, xy.x, xy.y, tile_size * span, tile_size * span);
        return;
    }
    
    if (options.location === 'floor') {
        
        let screen = this.screen;
        let floorId = options.floorId;
        let dof = options.dof;
        let alpha = this.alpha || 1;
        let pTile = game.getPlayerCurrentTile();
        
        // Ignore draw request if floors are different;
        if (floorId !== pTile.floor.id) { return; }
        
        var ctx;
        if (dof === 'BACKGROUND') {
            ctx = screen.background.ctx;
        } else if (dof === 'FOREGROUND') {
            ctx = screen.foreground.ctx;
        }
        
        // Get subtriangle dimensions
        var floor = this.floors[floorId];
        var source_tile_size = img.width / floor.cols;
        
        let origin = this.getOrigin(pTile);
        let sx = origin.col * source_tile_size;
        let sy = origin.row * source_tile_size;
        let sWidth = this.cols * source_tile_size;
        let sHeight = this.rows* source_tile_size;
        
        
        if (alpha !== 1) {
            console.log(alpha);
            ctx.globalAlpha = 1 - alpha;
        }
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, this.screen.width, this.screen.height);
        //ctx.drawImage(img, floor.left, floor.top, floor.width, floor.height);
        ctx.globalAlpha = 1;

        return;
    }
    
};

Gameboy.prototype.getOrigin = function(tile) {
    
    var origin = {
        row: tile.row - (this.rows - 1)/2,
        col: tile.col - (this.cols - 1)/2
    };
    
    return origin;
    
};



// Get various offsets relative to player's position
Gameboy.prototype.getOffsets = function(tile) {
    
    return;
    
    // Get camera offset used by various drawing methods
    var pTile = game.getPlayerCurrentTile();
    
    // Amount that camera is off from steady state (mainly for interpolation)
    var offset_top = (pTile.row + .5) % 1;
    var offset_left = pTile.col % 1;
    
    offset_top *= this.tile_size;
    offset_left *= this.tile_size;
    
    // Width and height of scree
    var width = this.screen.background.width;
    var height = this.screen.foreground.height;  
   
    // Origin is the top, left corner of the gameboy
    var origin = this.getOrigin(pTile);
    
    var tile_size = source.width / floor.cols;
    
    var source = {
        tile_size: tile_size
    }
    
    //var layer.canavs;
    
    var sWidth = this.cols * source.tile_size;
    
    
//    var sx = origin.col * this.tile_size;
//    var sy = origin.row * this.tile_size;    
//    
//    // Width and height of camera (gameboy)
//    var sWidth = this.cols * this.tile_size;
//    var sHeight = this.rows * this.tile_size;

    var floor = pTile.floor;
    
    var f = floor.id;
    var background = this.floors[f].background;
    var foreground = this.floors[f].foreground;
    
    // Actual width and height of portion of visible floor
    // (in case img does not fully cover camera)
    var imgWidth = background.img.width() - sx;
    var imgHeight = background.img.height() - sy;
    
    return {
        offset_top: offset_top,
        offset_left: offset_left,
        
        sx: sx,
        sy: sy,
        sWidth: sWidth,
        sHeight: sHeight,
        
    }
    
};


Gameboy.prototype.drawGameboy = function() {  
    
    //if (!this.canvas) { return; }
    
    var game = this.game;
    
    

    // Get camera offset used by various drawing methods
    var pTile = game.getPlayerCurrentTile();
    
    var offset_top = (pTile.row + .5) % 1;
    var offset_left = pTile.col % 1;
    
    offset_top *= this.tile_size;
    offset_left *= this.tile_size;
    
    var width = this.screen.background.canvas.width;
    var height = this.screen.background.canvas.height;  
   
    // Origin is the top, left corner of the gameboy
    var origin = this.getOrigin(pTile);
    
    var sx = origin.col * this.tile_size;
    var sy = origin.row * this.tile_size;    
    
    // Width and height of camera (gameboy)
    var sWidth = this.cols * this.tile_size;
    var sHeight = this.rows * this.tile_size;

    var floor = pTile.floor;
    
    var f = floor.id;
    var background = this.floors[f].background;
    var foreground = this.floors[f].foreground;
    
    // Actual width and height of portion of visible floor
    // (in case img does not fully cover camera)
    var imgWidth = background.img.width() - sx;
    var imgHeight = background.img.height() - sy;
    
    
    
    this.drawRocklayer(offset_top, offset_left, width, height);
    this.drawWaterlayer(offset_top, offset_left, width, height, imgWidth, imgHeight);
    this.drawFloor();  
    //this.drawGrid();
    //this.drawTransition();
    
};

Gameboy.prototype.drawRocklayer = function(offset_top, offset_left, width, height) {
    
    var game = this.game;

    this.rocklayer.img.css('top', -offset_top);
    this.rocklayer.img.css('left', -offset_left);
    
    //this.ctx.drawImage(this.gameboybackground.canvas, offset_left, offset_top, width, height, 0, 0, width, height);
    
};

Gameboy.prototype.drawWaterlayer = function(offset_top, offset_left, width, height, imgWidth, imgHeight) {
    
    this.updateWaterlayer();
    
    var img = this.waterlayer.img[this.currentLayer];
    //var img = this.waterlayer.img[0];
            
    // Offset layer based on current position of player        
    img.css('top', -offset_top);
    img.css('left', -offset_left);

    
    // Clip extra water layer
    var tile_size = this.tile_size;
    var waterWidth = this.waterlayer.cols * tile_size;
    var waterHeight = this.waterlayer.rows * tile_size;
    var fromTop = 0;
    var fromRight = waterWidth - offset_left - imgWidth;
    var fromBottom = waterHeight - offset_top - imgHeight;
    
    // A little buffer
    fromRight += tile_size/2;
    fromBottom += tile_size/2;
    //var fromBottom = 900;
    var fromLeft = 0;
    var clipPath = 'inset(' + fromTop + 'px ' + fromRight + 'px ' + fromBottom + 'px ' + fromLeft + 'px )';
    
    img.css('clip-path', clipPath);
     
};


Gameboy.prototype.drawFloor = function() {
    
   
    var game = this.game;

    var pTile = game.getPlayerCurrentTile();    
    var floor = pTile.floor;
   
    // Origin is the top, left corner of the gameboy
    var origin = this.getOrigin(pTile);
    
    var sx = origin.col * this.tile_size;
    var sy = origin.row * this.tile_size;    
    
    
    var sWidth = this.cols * this.tile_size;
    var sHeight = this.rows * this.tile_size;
    
    var f = floor.id;
    var background = this.floors[f].background;
    var foreground = this.floors[f].foreground;
    
    background.img.css('top', -sy);
    background.img.css('left', -sx);
    
    foreground.img.css('top', -sy);
    foreground.img.css('left', -sx);
    
    
    
    if (this.activeFloor !== f) {
        
        let prevFloor = this.floors[this.activeFloor];
        
        prevFloor.background.img.hide(0);
        prevFloor.foreground.img.hide(0);
        
        background.img.show(0);
        foreground.img.show(0);
        
        this.activeFloor = f;
    };
    
    //this.ctx.fillStyle = 'blue';
    //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    sx = origin.col * floor.tile_size;
    sy = origin.row * floor.tile_size;
    sWidth = this.cols * floor.tile_size;
    sHeight = this.rows * floor.tile_size;
    
    
    //this.ctx.drawImage(floor.frame.canvas, sx, sy, sWidth, sHeight, 0, 0, this.canvas.width, this.canvas.height);
    
};





Gameboy.prototype.drawTransition = function() {
    
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


Gameboy.prototype.createGameboyBackground = function() {
    
    var game = this.game;
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.canvas.width + this.tile_size;
    canvas.height = this.canvas.height + this.tile_size;
    
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
    
    // Make background 1 row/col larger
    for (let r = 0; r < rows + 1; r++) {
        for (let c = 0; c < cols + 1; c++) {
     
            let y = r * tile_size;
            let x = c * tile_size;

            ctx.drawImage(rockSprite.canvas, x, y, tile_size, tile_size);
            
        }
    }
    
    // Attach rocklayer to floor via bitmap object
    var gameboybackground = {
        canvas: canvas,
        ctx: ctx
    };
    
    this.gameboybackground = gameboybackground;
    
};



Gameboy.prototype.createGrid = function() {

    // Create reusable context
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width = this.canvas.width + this.tile_size;
    canvas.height = this.canvas.height + this.tile_size;
    ctx.strokeStyle = 'purple';

    
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
    
    this.grid = {
        canvas: canvas,
        ctx: ctx
    };

};


Gameboy.prototype.drawGrid = function() {

    var game = this.game;

    var activeLayers = game.getMapLayers();

    if (activeLayers.GRID) {

        var pTile = game.getPlayerCurrentTile();
            
        var offset_top = (pTile.row + .5) % 1;
        var offset_left = pTile.col % 1;
        
        offset_top *= this.tile_size;
        offset_left *= this.tile_size;
        
        var width = this.canvas.width;
        var height = this.canvas.height;
        
        this.ctx.drawImage(this.grid.canvas, offset_left, offset_top, width, height, 0, 0, width, height);

    }

};


Gameboy.prototype.updateWaterlayer = function() {
    
    var game = this.game;
    
    var ticks = game.getTicks();
    
    let i = Math.floor( (ticks/16) % 8 );  
    
    if (i !== this.currentLayer) {   
        
        var img = this.waterlayer.img;
        img[this.currentLayer].hide(0);
        img[i].show(0);
        this.currentLayer = i;
        
    }
    
};









Gameboy.prototype.getXYFromTile = function(tile) {
    
    var pTile = this.game.getPlayerCurrentTile();
    
    if (tile.floor.id !== pTile.floor.id) { return null; };
    
    var origin = {
        row: pTile.row - (this.rows - 1)/2,
        col: pTile.col - (this.cols - 1)/2
    };
    
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






////Nope
//Gameboy.prototype.drawPlayer = function() {
//  
//  
//    var game = this.game;
//    var tile_size = this.tile_size;
//    
//    var center = {
//        row: this.rows/2,
//        col: this.cols/2
//    };
//    
//    var dx = center.row - .5;
//    var dy = center.col - .5;
//    
//    dx *= tile_size;
//    dy *= tile_size;
//    
//    var sprites = game.getPlayerSprites();
//    
//    for (let s of sprites) {
//        let sprite = s[0];
//        let tile = s[1];
//        let xy = this.getGameboyXY(tile);     
//        if (xy) {       
//            this.ctx.drawImage(sprite.canvas, xy.x - (tile_size/2), xy.y - (tile_size/2), tile_size * 2, tile_size * 2);         
//        }
//    }
//
//    
//};

//Gameboy.prototype.initCanvas = function() {
//    
//    var game = this.game;
//    
//    var canvasId = 'gameboy';
//    
//    // Define canvas objects
//    var canvas = document.getElementById(canvasId);
//    var ctx = canvas.getContext('2d');
//    
//    ctx.mozImageSmoothingEnabled = false;
//    ctx.webkitImageSmoothingEnabled = false;
//    ctx.msImageSmoothingEnabled = false;
//    ctx.imageSmoothingEnabled = false;
//       
//    $(canvas).css('z-index', this.zIndex.canvas);      
//    
//    var tile_size = this.tile_size;
//    //this.tile_size = 32;
//
//    
//    this.canvas = canvas;
//    this.ctx = ctx;
//    
//};


//

//Gameboy.prototype.resizeCanvas = function() {
//    
//    var screen_width = $('.gameboy-screen').width();
//    
//    // Compute tile size (based on canvas size, or fixed)
//    this.tile_size = Math.floor(screen_width / this.cols);
//    if (this.tile_size % 2 !== 0) {
//        this.tile_size--;
//    }
//    
//    // Update canvas width and height
//    this.canvas.width = this.tile_size * this.cols;
//    this.canvas.height = this.tile_size * this.rows;
//    
//    $('.gameboy-screen').css('width', 'auto');    
//    
//    
//};


//Monitor.prototype.initCanvas = function() {
//   
//   var game = this.game;
//    
//    var canvasId = 'monitor';
//    
//    // Define canvas objects
//    var canvas = document.getElementById(canvasId);
//    var ctx = canvas.getContext('2d');
//    
//    ctx.mozImageSmoothingEnabled = false;
//    ctx.webkitImageSmoothingEnabled = false;
//    ctx.msImageSmoothingEnabled = false;
//    ctx.imageSmoothingEnabled = false;
//    
//    // Max number of cols in a floor
//    // Sum of rows in floor
//    var floors = game.getFloors();
//    var cols = Number.NEGATIVE_INFINITY;
//    var rows = 0;
//    for (let f in floors) {
//        cols = Math.max(floors[f].cols, cols);
//        rows += floors[f].rows;
//    }
//    
//    rows += this.floorborder.rows * 4;
//    cols += this.floorborder.cols * 2;
//    
//    this.rows = rows;
//    this.cols = cols;
//    
//    $(canvas).css('z-index', this.zIndex.canvas);
//    
//    this.canvas = canvas;
//    this.ctx = ctx;
//    
//    
//};
