var SpriteSheet = function(spritesheet_data) {
    this.player = spritesheet_data.player();
    this.pokemon = spritesheet_data.pokemon();
    this.dust = spritesheet_data.dust();
    this.head = spritesheet_data.head();
    this.flag = spritesheet_data.flag();
    //this.mewtwo = spritesheet_data.mewtwo();
    this.obstacle = spritesheet_data.obstacle();
    this.tile = spritesheet_data.tile();
    this.spritesheet_data = spritesheet_data;
    
    
    // Objects to hold both spritesheet canvases
    this.color = {};
    this.bw = {};
    this.sprite = {};
    this.initCanvas('color');
    this.initCanvas('bw');    
    this.sprite_size = this.color.canvas.width / spritesheet_data.rows();
};


SpriteSheet.prototype.initCanvas = function(type) {
    
    var spritesheet_data = this.spritesheet_data;
    
    // Define canvas objects
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    // Select either color or black/white spritesheet
    var imgId = 'spritesheet-' + type;
    var spritesheet_img = document.getElementById(imgId);
    
    canvas.width = spritesheet_img.width;
    canvas.height = spritesheet_img.height;
    
    ctx.drawImage(spritesheet_img, 0, 0);
   
    this[type] = {
        canvas: canvas,
        ctx: ctx
    };

};

SpriteSheet.prototype.initSprite = function() {
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    canvas.width = this.sprite_size;
    canvas.height = this.sprite_size;
    
    this.sprite = {
       canvas: canvas,
       ctx: ctx
    };

};

SpriteSheet.prototype.getSprite = function(spriteOptions, color=true) {
    
    
    
   ;
    var sprite_size = this.sprite_size;
    
    this.sprite.ctx.clearRect(0, 0, sprite_size, sprite_size);
    
    // Get correct spritesheet
    var spritesheet = this.color;
    if (!color) {
        spritesheet = this.bw;
    }
    
    if (!Array.isArray(spriteOptions)) {
        spriteOptions = [spriteOptions];
    }
    
    for (let options of spriteOptions) {
        var xy = this.getXY(options);
        this.sprite.ctx.drawImage(spritesheet.canvas, xy.x, xy.y, sprite_size, sprite_size, 0, 0, sprite_size, sprite_size);     
    }
    
    return this.sprite;
};

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
    
//    // Sprite is Mewtwo
//    if (spriteOptions.TYPE === 'MEWTWO') {
//        return this.mewtwo;
//    }
    
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

SpriteSheet.prototype.getXY = function(spriteOptions) {
    
    var rowcol = this.getRowCol(spriteOptions); 
    var y = rowcol[0] * this.sprite_size;
    var x = rowcol[1] * this.sprite_size;
    
    return {
        x: x,
        y: y
    };
    
};
 

