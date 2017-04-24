var Gameboy = function(game) {
    
    this.game = game;
    this.rows = 10;
    this.cols = 15;
    
    this.rockGreen = '#4CAF50';
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
    
    var screen_width = $('.screen').width();
    
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


Gameboy.prototype.drawGameboy = function() {  
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGameboyBackground();
    this.drawFloor();
    
};

Gameboy.prototype.getOrigin = function(tile) {
    
        var origin = {
        row: tile.row - (this.rows - 1)/2,
        col: tile.col - (this.cols - 1)/2
    };
    
    return origin;
    
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

Gameboy.prototype.drawGameboyBackground = function() {
    
    var game = this.game;
    
    if (game.getLayerState() === 'GRAPHIC') {
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
    
    this.ctx.drawImage(this.gameboybackground.canvas, offset_left, offset_top, width, height, 0, 0, width, height);
    
};

Gameboy.prototype.drawFloor = function() {
    
   
    var game = this.game;

    var pTile = game.getPlayerCurrentTile();    
    var floor = pTile.floor;
   
    // Origin is the top, left corner of the gameboy
    var origin = this.getOrigin(pTile);
    
    var sx = origin.col * floor.tile_size;
    var sy = origin.row * floor.tile_size;    
    
    
    var sWidth = this.cols * floor.tile_size;
    var sHeight = this.rows * floor.tile_size;
    
    this.ctx.drawImage(floor.frame.canvas, sx, sy, sWidth, sHeight, 0, 0, this.canvas.width, this.canvas.height);
    
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
