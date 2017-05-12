// SpriteSheet constructor
var SpriteSheet = function(game, spritesheet_data) {
    
    this.game = game;
    
    // Get data from sprite_sheet data file
    this.player = spritesheet_data.player();
    this.pokemon = spritesheet_data.pokemon();
    this.dust = spritesheet_data.dust();
    this.head = spritesheet_data.head();
    this.flag = spritesheet_data.flag();
    this.obstacle = spritesheet_data.obstacle();
    this.tile = spritesheet_data.tile();
    this.spritesheet_data = spritesheet_data;
    this.rows =  spritesheet_data.rows();
    this.cols =  spritesheet_data.cols();
    
    this.spritesheet_data = spritesheet_data;
    
    /*
     * Spritesheet object consists of 
     * - Bitmap spritesheet image (loaded by DOM)
     * - Canvas dervied from spritesheet image
     * - Small reusable canvas, size of individual sprite
     */
    
    // Object to hold spritesheet canvas
    this.sheet = {}; 
    
    // Object to hold individual sprite canvas
    this.sprite = {};
    
    // Flag indicating whether spritesheet images have loaded
    this.loaded = false;
   
};

// Initialize spritesheet
SpriteSheet.prototype.init = function() {
    
    // Initialize bitmap image
    this.initImage();
    
    
    // If image has loaded, initialize canvas and sprite
    var self = this;   
    if (this.img.complete) {
        
        this.initCanvas();
        this.initSprite();
        this.loaded = true;
    } 
    // Otherwise, attach event handler and wait
    else {       
        $(this.img).on('load', function() {           
            
            // Then initialize
            self.initCanvas();
            self.initSprite();
            self.loaded = true;
            
        });  
    }  
};

// Initialize spritesheet image
SpriteSheet.prototype.initImage = function() {
  
    // Get image from DOM, attach to object
    var imgId = 'spritesheet';
    this.img = document.getElementById(imgId);    
    
};

// Initialize spritesheet canvas
SpriteSheet.prototype.initCanvas = function() {
    
    var canvasSize = {
        width: this.img.width,
        height: this.img.height
    };
    
    // Create blank canvas, context
    // Attach to object
    this.sheet = this.game.createCanvasCtx(canvasSize);

    
    // Draw bitmap spritesheet image to canvas sheet
    this.sheet.ctx.drawImage(this.img, 0, 0);

};

// Intialize sprite canvas
SpriteSheet.prototype.initSprite = function() {
    
    // Compute sprite size based on size of bitmap spritesheet
    this.sprite_size = this.img.width / this.spritesheet_data.cols();
    
    // Define size of canvas
    var canvasSize = {
        width: this.sprite_size,
        height: this.sprite_size
    };
    
    // Create blank canvas, context
    this.sprite = this.game.createCanvasCtx(canvasSize);
   
};


// Get sprite canvas based on sprite options
SpriteSheet.prototype.getSprite = function(spriteOptions) {
    
    // Return if image has not yet loaded
    if (!this.img.complete) { return; }
    
    // Get sprite size and sprite sheet
    var sprite_size = this.sprite_size;
    var sheet = this.sheet;
    
    // Clear sprite canvas
    this.sprite.ctx.clearRect(0, 0, sprite_size, sprite_size);
    
    // Turn sprite options into an array, if not already
    if (!Array.isArray(spriteOptions)) {
        spriteOptions = [spriteOptions];
    }
    
    // Loop through sprite options of each sprite
    // User might request multiple sprites be drawn at same time
    for (let options of spriteOptions) {
        
        // Get x,y of sprite in spritesheet
        let xy = this.getXY(options);

        // Draw sprite from spritesheet to sprite canvas
        this.sprite.ctx.drawImage(sheet.canvas, xy.x, xy.y, sprite_size, sprite_size, 0, 0, sprite_size, sprite_size);     
    }
    
    // Return sprite canvas/context
    return this.sprite;
};

// Get row, column of sprite in spritesheet based on sprite options
SpriteSheet.prototype.getRowCol = function(spriteOptions) {
      
    // Sprite is a player (has a gender)
    if (spriteOptions.TYPE === 'PLAYER') {      
        var GENDER = spriteOptions.GENDER;
        var ACTIVITY = spriteOptions.ACTIVITY;
        var FACING = spriteOptions.FACING;
        var ORIENTATION = spriteOptions.ORIENTATION;
        var rowcol = this.player[GENDER][ACTIVITY][FACING][ORIENTATION];
        
        return rowcol;
    }
    
    // Sprite is a surf pokemon
    if (spriteOptions.TYPE === 'POKEMON') {
        var FACING = spriteOptions.FACING;
        var ORIENTATION = spriteOptions.ORIENTATION;
        var rowcol = this.pokemon[FACING][ORIENTATION];
        
        return rowcol;
    }
    
    // Sprite is a dust
    if (spriteOptions.TYPE === 'DUST') {
        var STAGE = spriteOptions.STAGE;
        var rowcol = this.dust[STAGE];
        
        return rowcol;
    }
    
    // Sprite is head
    if (spriteOptions.TYPE === 'HEAD') {
        var GENDER = spriteOptions.GENDER;
        var FACING = spriteOptions.FACING;
        var rowcol = this.head[GENDER][FACING];
        
        return rowcol;
    }
    
    
    // Sprite is flag
    if (spriteOptions.TYPE === 'FLAG') {
        var EVENT = spriteOptions.EVENT;
        var rowcol = this.flag[EVENT];
        
        return rowcol;
    }
    
    
    // Sprite is obstacle
    if (spriteOptions.TYPE === 'OBSTACLE') {
        var LABEL = spriteOptions.LABEL;
        return this.obstacle[LABEL];
    }
    
    
    // Sprite is surface tile (water or rock)
    if (spriteOptions.TYPE === 'TILE') {
        var SURFACE = spriteOptions.SURFACE;
        var NUM = spriteOptions.NUM;
        return this.tile[SURFACE][NUM];
    }       
};

// Get x,y of sprite in spritesheet based on sprite options
SpriteSheet.prototype.getXY = function(spriteOptions) {
    
    // Get row and column location of sprite
    var rowcol = this.getRowCol(spriteOptions); 
    
    // Get x,y using sprite size
    var y = rowcol[0] * this.sprite_size;
    var x = rowcol[1] * this.sprite_size;
    
    return {
        x: x,
        y: y
    };
    
};