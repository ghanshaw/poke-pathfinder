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

Gameboy.prototype.init = function() {
    
    this.initCanvas();
    this.initRocklayer();
    this.initFloors();
    this.initWaterlayer();
    
};

Gameboy.prototype.initCanvas = function() {
    
    var game = this.game;
    
    var canvasId = 'gameboy';
    
    // Define canvas objects
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    var screen_width = $('.gameboy-screen').width();
    
    // Compute tile size (based on canvas size, or fixed)
    this.tile_size = Math.floor(screen_width / this.cols);
    if (this.tile_size % 2 !== 0) {
        this.tile_size--;
    }
    
    var tile_size = this.tile_size;
    //this.tile_size = 32;
    
    // Update canvas height
    canvas.width = this.tile_size * this.cols;
    canvas.height = this.tile_size * this.rows;
    
    this.canvas = canvas;
    this.ctx = ctx;
    
};

Gameboy.prototype.initRocklayer = function() {
  
    var game = this.game;

    var rocklayer = game.getRocklayer();  
   
    this.rocklayer['img'] = $(rocklayer.img).clone();
    this.rocklayer.rows = rocklayer.rows;
    this.rocklayer.cols = rocklayer.cols;
    
    var width = this.tile_size * this.rocklayer.cols; 
    
    $(this.rocklayer.img).addClass('layer');
    $(this.rocklayer.img).css('z-index', this.zIndex.rocklayer);
    $('.gameboy-screen').append(this.rocklayer.img);
    
};

Gameboy.prototype.initWaterlayer = function() {
    
    var game = this.game;
    var waterlayer = game.getWaterlayer();
    
    for (let imgWater of waterlayer.img) {
        let img = $(imgWater).clone();
        img.addClass('layer');
        img.css('z-index', this.zIndex.waterlayer);
        this.waterlayer.img.push(img);
    }
    this.waterlayer.rows = waterlayer.rows;
    this.waterlayer.cols = waterlayer.cols;
    
    
    for (let img of this.waterlayer.img) {
        $('.gameboy-screen').append(img);
    }
    
};


Gameboy.prototype.initGameboyBackground = function() {
    

    
};


Gameboy.prototype.initFloors = function() {
  
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
            },
            rows: 0,
            cols: 0
        };
        
        floor.rows = mapFloor.rows;
        floor.cols = mapFloor.cols;
       
        floor.background.img = $(mapFloor.background.img).clone();
        floor.background.img.css('z-index', this.zIndex.background);
        floor.background.img.addClass('layer');
        floor.background.img.hide(0);
        

        
        floor.foreground.img = $(mapFloor.foreground.img).clone(); 
        floor.foreground.img.css('z-index', this.zIndex.foreground);
        floor.foreground.img.addClass('layer');
        floor.foreground.img.hide(0);
        
        // Append all the elements to the monitor
        $('.gameboy-screen').append(floor.background.img);
        $('.gameboy-screen').append(floor.foreground.img);
        
        this.floors[f] = floor;
        

        
    };
    
    // Activate one of the floors
    this.activeFloor = 'F1';
    this.floors['F1'].background.img.show(0);
    this.floors['F1'].foreground.img.show(0);

    
};


Gameboy.prototype.resizeGameboy = function() {
    
    
    this.resizeRocklayer();
    this.resizeFloors();
    this.resizeWaterlayer();
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





Gameboy.prototype.drawGameboy = function() {  
    
    var game = this.game;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawRocklayer();
    
    
    var pTile = game.getPlayerCurrentTile();
    
    var offset_top = (pTile.row + .5) % 1;
    var offset_left = pTile.col % 1;
    
    offset_top *= this.tile_size;
    offset_left *= this.tile_size;
    
    var width = this.canvas.width;
    var height = this.canvas.height;
    
    
    
    this.drawWaterlayer(offset_top, offset_left, width, height);
    this.drawFloor();  
    this.drawGrid();
    this.drawTransition();
    
};

Gameboy.prototype.getOrigin = function(tile) {
    
    var origin = {
        row: tile.row - (this.rows - 1)/2,
        col: tile.col - (this.cols - 1)/2
    };
    
    return origin;
    
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

Gameboy.prototype.drawWaterlayer = function(offset_top, offset_left, width, height) {
    
    this.updateWaterlayer();
    
    
    var img = this.waterlayer.img[this.currentLayer];
            
    img.css('top', -offset_top);
    img.css('left', -offset_left);
    
    var waterWidth = this.waterlayer.cols * this.tile_size;
    var waterHeight = this.waterlayer.rows * this.tile_size;
    var fromTop = 0;
    var fromRight = waterWidth - width;
    var fromBottom = waterHeight - height;
    var fromLeft = 0;
    var clipPath = 'inset(' + fromTop + 'px ' + fromRight + 'px ' + fromBottom + 'px ' + fromLeft + 'px )';
    
    img.css('clip-path', clipPath);
    
    
    
};

Gameboy.prototype.drawRocklayer = function() {
    
    var game = this.game;
    
    if (game.getMapState() === 'GRAPHIC') {
        this.ctx.fillStyle = this.rockGreen;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        return;
    }
  
    var pTile = game.getPlayerCurrentTile();
    
    var offset_top = (pTile.row + .5) % 1;
    var offset_left = pTile.col % 1;
    
    offset_top *= this.tile_size;
    offset_left *= this.tile_size;
    
    var width = this.canvas.width;
    var height = this.canvas.height;
    
    this.rocklayer.img.css('top', -offset_top);
    this.rocklayer.img.css('left', -offset_left);
    
    //this.ctx.drawImage(this.gameboybackground.canvas, offset_left, offset_top, width, height, 0, 0, width, height);
    
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
    
    //this.ctx.drawImage(floor.frame.canvas, sx, sy, sWidth, sHeight, 0, 0, this.canvas.width, this.canvas.height);
    
};



Gameboy.prototype.getGameboyXY = function(tile) {
    
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
