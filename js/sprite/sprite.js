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
    
    this.playerOptions = {
        TYPE: 'PLAYER',
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'LEFT'
    };
    
    this.pokemonOptions = {
        TYPE: 'POKEMON',
        FACING: 'DOWN',
        ORIENTATION: 'DOWN'
    };
    
    this.dustOptions = {
        TYPE: 'DUST',
        STAGE: 1
    };
    
    // Variables for different movements;
    this.walkSpeed = 3.5;
    this.steps = 0;
    
    this.surfSpeed = 5;
    this.surfTicks = 0;
    
    this.jumpSpeed = 1;
    
    
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
    
};


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


Sprite.prototype.changeDirection = function(DIRECTION) {
    this.playerOptions.FACING = DIRECTION;
};

Sprite.prototype.setTile = function(tile) {
    var prevTile = this.tile;
    
    this.tile = tile;
    this.current = {
        row: tile.row,
        col: tile.col
    };
    
    
    // If he's on water, increment surf counter
    if (prevTile && prevTile.type === 'LAND' && tile.type === 'WATER') { 
        this.surfTicks = 0;
    }
    
};



Sprite.prototype.startMove = function() {
    
    
    
};






Sprite.prototype.interpolateWalkSurf = function() {
    
    var current = this.current;
    var start = this.start;
    var displacement = this.displacement;
    var time = this.time;
    
    
    current.row = start.row + (displacement.row * time.percent);
    current.col = start.col + (displacement.col * time.percent);
    
};


Sprite.prototype.parabolicMove = function(x) {
    //-8.16\left(x-\ .35\right)^{2\ }+\ 1
    
    // If you're jumping on, use a predictable parabola to define movement
    // If you're jumping off, jumping should occur before 70% of move time
    
    // First parabolic function is also used to change opacity during floor transition
    
    var y;
    if (this.MOVE_STATE === 'JUMP ON' || this.MOVE_STATE === 'LADDER') {
        y = -4*Math.pow((x - 0.5),2) + 1;
    }
    else if (this.MOVE_STATE === 'JUMP OFF') {
        y = Math.max((-8.16*Math.pow((x - 0.35),2) + 1), 0);
    }
    
    return y;  
};


Sprite.prototype.interpolateJump = function() {
    
    var current = this.current;
    var start = this.start;
    var displacement = this.displacement;
    var time = this.time;
    
    
    var formula_x = time.percent;   // Percentage through move
    var formula_y = this.parabolicMove(formula_x);    // Height w.r.t. time
    var sign = displacement.row + displacement.col;
    
    if (this.MOVE_STATE === 'JUMP ON') {
       
        var horizontal_displacement = sign * time.percent;
        var vertical_displacement = formula_y;

    }
  
    else if (this.MOVE_STATE === 'JUMP OFF') {
        
        // If you're jumping off, increase horizontal displacement to compensate shortened jump
        // Player must spend last 30% of move standing still
        var horizontal_displacement = sign * Math.min(time.percent/.7, 1);
        var vertical_displacement = formula_y;
        
    }
        
    // If you're jumping across rows
    if (displacement.row !== 0) {
           
        current.row = start.row + horizontal_displacement - vertical_displacement;
        //current.row = start.row + (displacement.row * time.percent) - vertical_displacement;
        current.col = start.col;
            
    } 
    // Otherwise, if you're jumping across columns
    else if (displacement.col !== 0) {
            
        current.col = start.col + horizontal_displacement;
        current.row = start.row - vertical_displacement;
            
    }
    
};

Sprite.prototype.interpolateLadder = function() {
    
    var time = this.time;
    var transitionLayer = this.map.transitionLayer;
    
    var formula_x = time.percent;   // Percentage through move
    var formula_y = this.parabolicMove(formula_x);    // Transparency of transiton layer
    
    transitionLayer.globalAlpha = formula_y;    
    
    if (time.percent > .5 && (this.tile.id !== this.endTile.id)) {
        this.setTile(this.endTile);
    }
    
};




Sprite.prototype.interpolateMove = function() {
    
    var time = this.time;
    //    var start = this.start;
    //    var current = this.current;
    //    var displacement = this.displacement;
    
    this.time.delta = (new Date() - time.start)/1000;
    this.time.percent = time.delta/time.total;
    

    if (this.time.percent < 1) {
        
        if (this.MOVE_STATE === 'WALK' || this.MOVE_STATE === 'SURF') {        
            this.interpolateWalkSurf();        
        }
        
        else if (this.MOVE_STATE === 'JUMP ON' || this.MOVE_STATE === 'JUMP OFF') {          
            this.interpolateJump();           
        }
        
        if (this.MOVE_STATE === 'LADDER') {
            this.interpolateLadder();
        }

    }
    
//    else if (this.game.DIRECTION) {
//        this.setTile(this.endTile);
//        this.steps += 1;
//        this.MOVE_STATE = 'STILL';
//        //this.map.startMove();
//        return;
    else {
        //console.error('NO DIRECTION');
        //
        // If player just finished jumping onto pokemon
        // Surf is begnning, reset surf ticks
        if (this.MOVE_STATE === 'JUMP ON') {
            // Reset surf counter 
            this.surfTicks = 0;
        }
        

        
//        if (this.usingLadder) {
//            
//            // Make screen go black
//            console.log(this);
//            var canvas = this.map.floors['F1'].canvas;
//            var ctx = canvas.getContext('2d');
//            this.setTile(this.endTile);
//            
//            var blackCanvas = document.createElement('canvas');
//            var blackCtx = canvas.getContext('2d');
//            
//            blackCanvas.width = canvas.width;
//            blackCanvas.height = canvas.height;
//            
//            blackCtx.fillStyle = 'black';
//            blackCtx.globalAlpha = 0.02;
//            
//            blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
//            
//            ctx.drawImage(blackCanvas, 0, 0, canvas.width, canvas.height);
//            
//            
//            ctx.drawImage();
//            // Make screen go bright
//        }
        this.steps += 1;
        

        
        this.setTile(this.endTile);      
        
        if (this.endTile.ladder && !this.startTile.ladder) {
            this.MOVE_STATE = 'LADDER';
            this.map.startMove();
            return;
        }

        this.MOVE_STATE = 'STILL';
        
        
        return;
    }    
    
};



// Update the attributes associated with player that dictate sprite in use
Sprite.prototype.updateSpriteOptions = function() {
    
    // Update spriteOptions of various sprites
    // Player Options: GENDER - ACTIVITY - FACING - ORIENTATION
    // Pokemon Options: FACING - ORIENTATON
    // Dust Options: STAGE
    var playerOptions = this.playerOptions;
    var pokemonOptions = this.pokemonOptions;
    var dustOptions = this.dustOptions;
    
    // Update sprite gender
    //options.GENDER = this.game.GENDER;
    playerOptions.GENDER = 'BOY';   
    
    if (this.MOVE_STATE === 'CLIMB') {
        
        // Hide dust and pokemon
        dustOptions.SHOW = false;
        pokemonOptions.SHOW = false;
        
    }

    
    if (this.MOVE_STATE === 'JUMP ON') {
        
        // Hide dust
        dustOptions.SHOW = false;
        
        // Update pokemon sprite options
        pokemonOptions.SHOW = true;
        pokemonOptions.FACING = playerOptions.FACING;
        
        // Update player sprite options
        playerOptions.ACTIVITY = 'JUMP'; 
        playerOptions.ORIENTATION = 'STRAIGHT';
        
    }
    
    
    else if (this.MOVE_STATE === 'JUMP OFF') {
        
        // Update pokemon sprite options
        pokemonOptions.SHOW = true;
        pokemonOptions.FACING = playerOptions.FACING;
        
        // Get orientation from the surfTicks variable
        if (this.surfTicks < 60) {
            pokemonOptions.ORIENTATION = 'UP';
        } else {
            pokemonOptions.ORIENTATION = 'DOWN';
        }
        
        
        // Update player sprite options
        playerOptions.ACTIVITY = 'JUMP'; 
        playerOptions.ORIENTATION = 'STRAIGHT';
        
        
        // Refine dust, player and sprite based on progress through move
        
        // Dust shown/pokemon presence is based on progress through jump move
        if (this.time.percent < .7) {  
            dustOptions.SHOW = false;
        }
        else if (this.time.percent < .8) {
            dustOptions.SHOW = true;         
            dustOptions.STAGE = '1';
            
            playerOptions.ACTIVITY = 'WALK'
            pokemonOptions.SHOW = false;
        }
        else if (this.time.percent < .9) {
            dustOptions.SHOW = true;
            dustOptions.STAGE = '2';
            
            playerOptions.ACTIVITY = 'WALK'
            pokemonOptions.SHOW = false;
        }
        
        if (this.time.percent > .9) {
            dustOptions.SHOW = true;
            dustOptions.STAGE = '3';
            
            playerOptions.ACTIVITY = 'WALK';
            pokemonOptions.SHOW = false;
        }
        
    }
    

    else if (this.tile.type === 'LAND') {
        
        // Hide dust and pokemon
        dustOptions.SHOW = false;
        pokemonOptions.SHOW = false;
        
        if (this.MOVE_STATE === 'STILL') {
            
            playerOptions.ACTIVITY = 'WALK'; 
            playerOptions.ORIENTATION = 'STRAIGHT';
            
        }    
        
        else if (this.MOVE_STATE === 'WALK' ||
                this.MOVE_STATE === 'WALL WALK' ||
                this.MOVE_STATE === 'TURN') {
            
            playerOptions.ACTIVITY = 'WALK';
            
            // Orientation is based on progress through move
            if (this.time.percent < .5) {
                
                // Determine orientation of sprite
                playerOptions.ORIENTATION = 'LEFT';
                if (this.steps % 2 === 1) {
                    playerOptions.ORIENTATION = 'RIGHT';
                }    
            }
            else {
                playerOptions.ORIENTATION = 'STRAIGHT';
            }
        }
        
    }
        
    else if (this.tile.type === 'WATER') { 
        
        // Hide dust and pokemon
        dustOptions.SHOW = false;
        pokemonOptions.SHOW = false;
        
        playerOptions.ACTIVITY = 'SURF';         
    
        if (this.surfTicks < 60) {
            playerOptions.ORIENTATION = 'UP';
        } else {
            playerOptions.ORIENTATION = 'DOWN';
        }
        
        this.surfTicks ++;
        //console.log(this.surfTicks, this.game.ticks/60);
        this.surfTicks %= 120;
    
    };
    
};




Sprite.prototype.drawSprite = function() {
 
    var floor = this.tile.floor;
    
    var row = this.current.row;
    var col = this.current.col;     
    
    var tile_size = floor.tile_size;
    
    
    if (this.active === 'GRAPHIC') {
        let x = col * tile_size + floor.offset_x - (.5 * tile_size);
        let y = row * tile_size + floor.offset_y - (.5 * tile_size);
        floor.canvas.ctx.drawImage(this.graphic.canvas, x, y, tile_size, tile_size);
    }
    
    else if (this.active === 'BITMAP') {
        
        let sprite_size = this.spritesheet.sprite_size;
        let ctx = floor.canvas.getContext('2d');
        
        // Draw surf pokemon sprite
        if (this.pokemonOptions.SHOW) {
            
            let row;
            let col;
            
            // If he's jumping on, pokemon appear on end tile
            if (this.MOVE_STATE === 'JUMP ON') {
                row = this.endTile.row;
                col = this.endTile.col;
            }    
            
            // If he's jumping off, pokemon appears on start tile
            else if (this.MOVE_STATE === 'JUMP OFF') {
                row = this.startTile.row;
                col = this.startTile.col;   
            }
              
            let x = col * tile_size + floor.offset_x - (.5 * tile_size);
            let y = row * tile_size + floor.offset_y - (.5 * tile_size);
            
            let xy = this.spritesheet.getXY(this.pokemonOptions);
            let sx = xy.x;
            let sy = xy.y;
            ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);
        }
        
        // Draw player sprite
        // Draw player on interpolated location
        let row = this.current.row;
        let col = this.current.col;    
        let x = col * tile_size + floor.offset_x - (.5 * tile_size);
        let y = row * tile_size + floor.offset_y - (.5 * tile_size);
        
        let xy = this.spritesheet.getXY(this.playerOptions);
        let sx = xy.x;
        let sy = xy.y;
        ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);

        // Draw dust sprite  
        if (this.dustOptions.SHOW) { 
            // Draw dust on tile player is jumping to
            let row = this.endTile.row;
            let col = this.endTile.col;    
            let x = col * tile_size + floor.offset_x - (.5 * tile_size);
            let y = row * tile_size + floor.offset_y - (.5 * tile_size);
            
            let xy = this.spritesheet.getXY(this.dustOptions);
            let sx = xy.x;
            let sy = xy.y;
            ctx.drawImage(this.spritesheet.canvas, sx, sy, sprite_size, sprite_size, x, y, tile_size * 2, tile_size * 2);
        }
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


