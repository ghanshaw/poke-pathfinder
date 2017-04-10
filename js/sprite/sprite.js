var Sprite = function() {
    
    this.active = 'BITMAP',
    this.status = 'STANDING';
    
    
    
    this.start = null;
    this.end = null;
    this.time = {};
    this.dir = {};
    this.tile = null;
    
    
    this.graphic = {};
    this.bitmap = {};
    
    // Bitmap options
    // gender: boy/girl
    // activity: walk, surf, jump
    // direction: up, down, left, right
    
    this.spriteOptions = {
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'LEFT'
    };
    
    // Speed in tile/second
    this.speed = 2.5;
    this.steps = 0;
    
    // Time measures used to account for movement
    this.time = {
        start: null,
        total: null,
        delta: null,
        percent: null
    };
    
    
    // Location variables used for interpolation
    this.start = {
        row: null,
        col: null
    };
    
    this.current = {
        row: null,
        col: null
    };
    
    this.MOVE_STATE = 'STILL';
    
}


Sprite.prototype.initGraphic = function() {
    //var img = new Image();
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    var size = canvas.width = canvas.height = 100;
    
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    
    this.graphic.canvas = canvas;
    
}

Sprite.prototype.initBitmap = function() {
    
    var spritesheet = new SpriteSheet(spritesheet_data);
    spritesheet.initCanvas();
    
    this.spritesheet = spritesheet;
    //this.bitmap.canvas = spritesheet.canvas;
    
};

// Update the attributes associated with payer that dictate sprite in use
Sprite.prototype.updateSpriteOptions = function() {
    
    // Update spriteOptions variable with current
    // GENDER - ACTIVITY - DIRECTION - ORIENTATION
    var options = this.spriteOptions;
    
    // Update sprite gender
    //options.GENDER = this.game.GENDER;
    options.GENDER = 'BOY';    
   
        
    // If sprite is on land
    if (this.tile.type === 'LAND') { 
        
        
        options.ACTIVITY = 'WALK'; 
            
        if (this.MOVE_STATE === 'MOVING') {
            
            //options.FACING = this.game.DIRECTION;
            
            // Orientation is based on progress through move
            if (this.time.percent < .5) {
                // Determine orientation of sprite
                options.ORIENTATION = 'LEFT';
                if (this.steps % 2 === 1) {
                    options.ORIENTATION = 'RIGHT';
                }
                
            }
            else {
                options.ORIENTATION = 'STRAIGHT';
            }

        }
        
        else if (this.MOVE_STATE === 'STILL') {   
            
            
            
            options.ORIENTATION = 'STRAIGHT';   
        }
         
    }
    
    // If he's on water
    if (this.tile.type === 'WATER') { 
        options.ACTIVITY = 'SURF'; 
    
    
    
    };
    
};


Sprite.prototype.drawSprite = function() {
 
    var floor = this.tile.floor;
    
    var row = this.current.row;
    var col = this.current.col;     
    
    var tile_size = floor.tile_size;
    var x = col * tile_size + floor.offset_x - (.5 * tile_size);
    var y = row * tile_size + floor.offset_y - (.5 * tile_size);    
    
    if (this.active === 'GRAPHIC') {
        floor.canvas.ctx.drawImage(this.graphic.canvas, x, y, tile_size, tile_size);
    }
    
    else if (this.active === 'BITMAP') {
        
        let xy = this.spritesheet.getXY(this.spriteOptions);
        
        let sx = xy.x;
        let sy = xy.y;
        let sprite_size = this.spritesheet.sprite_size;
        
        let ctx = floor.canvas.getContext('2d');
        ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);
    }
    
};

Sprite.prototype.changeDirection = function(DIRECTION) {
    this.spriteOptions.FACING = DIRECTION;
};

Sprite.prototype.setTile = function(tile) {
    this.tile = tile;
    this.current = {
        row: tile.row,
        col: tile.col
    };
};



Sprite.prototype.startMove = function() {
    
    
    
};



Sprite.prototype.interpolateMove = function(game) {
    
    var time = this.time;
    var start = this.start;
    var current = this.current;
    var displacement = this.displacement;
    
    this.time.delta = (new Date() - time.start)/1000;
    this.time.percent = time.delta/time.total;


    if (this.time.percent < 1) {
        current.row = start.row + (displacement.row * time.percent);
        current.col = start.col + (displacement.col * time.percent);
        return;
//        console.log('----------');
//        console.log(start);
//        console.log(displacement);
//        console.log(time);
//        console.log(current);
    
    }
    
    else if (this.game.DIRECTION) {
        this.setTile(this.endTile);
        this.steps += 1;
        this.map.startMove();
        return;
    } else {
        console.error('NO DIRECTION');
        this.setTile(this.endTile);
        this.MOVE_STATE = 'STILL';
        this.steps += 1;
        return;
    }
};
















//
//Sprite.moveSprite = function(direction) { }
//
//Sprite.prototype.BitampSprite = function() {
//    
//    var sprite_sheet = sprite_sheet();
// 
//    var canvas = document.createElement('canvas');
//    var ctx = canvas.getContext('2d');
//    
//    sprite.boy = sprite_sheet.boy();
//    
//}
//
//Sprite.prototype.getSpriteSheetXY = function(spriteIndex) {
//    
//    var row = spriteIndex[0];
//    var col = spriteIndex[1];
//    
//    
//    
//}
//
//Sprite.prototype.getSprite = function(spriteIndex) {
//    
//    
//    
//}
//














Sprite.prototype.updateXY = function(x, y) {
    
    this.x = x;
    this.y = y;
    
}

//Sprite.prototype.followPath = function(path) {
//    
//    if (!path) {
//        return;
//    }
//        
//        
//    
//    if (this.status != 'WALKING' && path.index < path.length - 2) {
//        
//        let i = path.index;
//        path.index += 1;
//        this.moveTile(path[i].tile, path[i+1].tile);
//        
//    }
//    
//    
//}



Sprite.prototype.dropTile = function(floor, row, col) {
    
    xy = floor.getXY(row, col);
    this.updateXY(xy.x, xy.y);
    
}







Sprite.prototype.lerp = function(start, end, dir, time) {

    var new_x = start.x + (dir.x * _speed * 1000) * time.delta;
    var new_y = start.y + (dir.y * _speed * 1000) * time.delta;

    console.log(new_x, new_y);

    var a = Math.abs(new_x - start.x);
    var b = Math.abs(end.x - start.x);
    var c = Math.abs(new_y - start.y);
    var d = Math.abs(end.y - start.y);

    console.log(a, b, c, d);

    if (a > b || c > d) {

        new_x = end.x;
        new_y = end.y;

        sprite.status = 'STANDING';
    
    }

    // Update sprite with new positions
    sprite.updateXY(new_x, new_y);
    //that.drawTileBackground();
    
}


