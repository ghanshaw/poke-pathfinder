var SpriteSheet = function(spritesheet_data) {
    this.player = spritesheet_data.player();
    this.spritesheet_data = spritesheet_data;
};


SpriteSheet.prototype.initCanvas = function() {
    
    var spritesheet_data = this.spritesheet_data;
    
    // Define canvas objects
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    var imgId = spritesheet_data.imgId();
    var spritesheet_img = document.getElementById(imgId);
    
    canvas.width = spritesheet_img.width;
    canvas.height = spritesheet_img.height;
    
    ctx.drawImage(spritesheet_img, 0, 0);
    
    var sprite_size = canvas.width / spritesheet_data.rows();
    
    this.sprite_size = sprite_size;
    this.canvas = canvas;

};


SpriteSheet.prototype.getRowCol = function(spriteOptions) {
    
    var player = this.player;
            
    // Sprite is a player (has a gender)
    if (spriteOptions.GENDER) {
        var GENDER = spriteOptions.GENDER;
        var ACTIVITY = spriteOptions.ACTIVITY;
        var FACING = spriteOptions.FACING;
        var ORIENTATION = spriteOptions.ORIENTATION;
        var rowcol = player[GENDER][ACTIVITY][FACING][ORIENTATION];
        
        return rowcol;
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
 

