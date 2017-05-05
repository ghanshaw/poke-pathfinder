var Player = function(game) {
    
    this.game = game;
    
    this.start = null;
    this.end = null;
    this.time = {};
    this.dir = {};
    this.tile = null;
    
    
    
    this.headOptions = {
        TYPE: 'HEAD',
        GENDER: 'BOY',
        FACING: 'DOWN'
    };   
    
    this.shape = {};
    
    // Bitmap options
    // gender: boy/girl
    // activity: walk, surf, jump
    // direction: up, down, left, right
    
    this.playerOptions = {
        TYPE: 'PLAYER',
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'STRAIGHT'
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
    this.wallWalkSpeed = 1.75;
    this.turnSpeed = 17.5;
    this.ladderSpeed = 1.5;
    
    
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
        col: null,
        floor: null
    };
    
    this.MOVE_STATE = 'STILL';
    
};


Player.prototype.initShape = function() {
    //var img = new Image();
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    var size = canvas.width = canvas.height = 100;
//    
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    
    this.shape.canvas = canvas;
    
};

Player.prototype.updatePlayer = function() {
    
    var game = this.game;
    var MOVE_STATE = this.MOVE_STATE;
    
    
    if (game.getPathfinderState() === 'VISUALIZER') {
        return;
    }
    
    if (MOVE_STATE === 'DRAG') {
        this.updateDrag();
        return;
    }
    
    if (MOVE_STATE === 'STILL' ||
            this.MOVE_STATE === 'WALL WALK') { 
        
        
        if (game.getKeypress()) {
            // console.log(this.KEYPRESS);
            this.setupMove();
        };
        
    }
    
    if (MOVE_STATE === 'WALK' || 
            MOVE_STATE === 'SURF' || 
            MOVE_STATE === 'JUMP ON' ||
            MOVE_STATE === 'JUMP OFF' ||
            MOVE_STATE === 'TURN' ||
            MOVE_STATE === 'WALL WALK' ||
            MOVE_STATE === 'LADDER') {
        
        if (MOVE_STATE === 'LADDER') {
            console.log('climb  baby climb');
        }
        
        this.interpolateMove();
    } 
    
    if (game.getPathfinderState() === 'PATHER') {
        game.KEYPRESS = null;
    }
    this.updateSpriteOptions();
    
};


Player.prototype.setupMove = function() {
    
    var game = this.game;
    var KEYPRESS = game.getKeypress();
    //var graph = this.graph;
    
    var startTile = this.tile;
    var floor = startTile.floor;
    var row = startTile.row;
    var col = startTile.col;  
    
    // Determine direction of movement
    var displacement = {
        row: 0,
        col: 0
    };
    
    if (KEYPRESS === 'UP') {
        displacement.row = -1;  
    }
    else if (KEYPRESS === 'DOWN') {
        displacement.row = +1; 
    }
    else if (KEYPRESS === 'LEFT') {
        displacement.col = -1;
    }
    else if (KEYPRESS === 'RIGHT') {
        displacement.col = +1;
    }
    
    // ----- 0. Climbing ladder ----- //
    // You were sent here by the end of another move
    if (this.MOVE_STATE === 'LADDER') {
        
        
        
        this.startTile = startTile;
        this.stopTile = game.getTileOtherEndLadder(startTile);
        
        //this.map.resetPath()
        this.game.pathfinder.index += 1;
        
        
        var speed = this.getSpeed();
        this.time.total = 1/speed;
        this.time.start = new Date();
        this.interpolateMove();
        return;        
    }
    
    // ----- 1. Turning ----- //
    // If player is still, and user direction does not match player direction
    // and game not currently following path
    if (this.MOVE_STATE === 'STILL' && game.getPathfinderState() === 'OFF') {
        
        //console.info('about to turn');
        
        if (KEYPRESS !== this.playerOptions.FACING) {
            console.info('turn');
            this.MOVE_STATE = 'TURN';
            this.changeDirection(KEYPRESS);
            
            // Reset surf counter
            this.surfTicks = 0;
            
            this.startTile = startTile;
            this.stopTile = startTile;
            
            var speed = this.getSpeed();
            this.time.total = 1/speed;
            this.time.start = new Date();
            this.interpolateMove();
            
            return;
        }
    }
    
    
    // ----- 2a. Walking into Walls ----- //
    // If user direction is same as current direction, continue walking into wall
    // Otherwise, interrupt and process user input
    if (this.MOVE_STATE === 'WALL WALK') {
        
        if (KEYPRESS === this.playerOptions.FACING) {
            this.interpolateMove();
            return;
        }
        
    }
    
    // Determine final tile
    var stopTile = game.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If startTile is a ladder
    
    // If stopTile is a ladder
    //    if (stopTile.ladder) {
    //        // Redirect player, move to ladder instead
    //        stopTile = this.getOtherEndLadder(stopTile);
    //    }        
    //    
    // If tile is reachable
    if (stopTile 
            && game.hasEdge(startTile, stopTile) 
            && !stopTile.obstacle) {
        
        // Movement is admissable, begin interpolation 
        this.changeDirection(KEYPRESS);
        this.startTile = startTile;
        this.stopTile = stopTile;
        
        
        this.start.row = row;
        this.start.col = col;
        
        this.displacement = displacement;
        
        // Set move state, determine time allotted for move
        var speed;
        // ----- 3. Jumping onto water pokemon ----- //
        if (startTile.type === 'LAND' && stopTile.type === 'WATER') {
            this.MOVE_STATE = 'JUMP ON';    
        } 
        // ----- 4. Jumping off of water pokemon ----- //
        else if (startTile.type === 'WATER' && stopTile.type === 'LAND') {      
            this.MOVE_STATE = 'JUMP OFF';
        }
        // ----- 5. Walking on land ----- //
        else if (startTile.type === 'LAND') {
            this.MOVE_STATE = 'WALK';
        }
        // ----- 6. Surfing on water ----- //
        else if (startTile.type === 'WATER') {         
            this.MOVE_STATE = 'SURF';
        }
        
        var speed = this.getSpeed();
        this.time.total = 1/speed;
        this.time.start = new Date();
        this.interpolateMove();
        
    }
    
    // ----- 2b. Walking into walls ----- //
    // Animate walking against wall
    else if (stopTile 
            && (!game.hasEdge(startTile, stopTile) || stopTile.obstacle)) {
        
        // Only animate walking into walls on land
        if(startTile.type === 'LAND') {
            
            this.MOVE_STATE = 'WALL WALK';
            this.changeDirection(KEYPRESS);
            
            this.changeDirection(KEYPRESS);
            this.startTile = startTile;
            this.stopTile = startTile;
            
            var speed = this.getSpeed();
            this.time.total = 1/speed;
            this.time.start = new Date();
            this.interpolateMove();
        }
        
    }
    
};


Player.prototype.changeDirection = function(KEYPRESS) {
    this.playerOptions.FACING = KEYPRESS;
};


Player.prototype.setTile = function(tile) {
    var prevTile = this.tile;
    
    this.tile = tile;
    this.current.row = tile.row;
    this.current.col = tile.col;
    this.current.floor = tile.floor;
    
    // If he's entering water, reset surf counter
    if (prevTile && prevTile.type === 'LAND' && tile.type === 'WATER') { 
        this.surfTicks = 0;
    }
    
};

Player.prototype.getCurrentTile = function() {
    return {
        row: this.current.row,
        col: this.current.col,
        floor: this.tile.floor,
        dof: this.tile.dof
    };
};

Player.prototype.getSpeed = function() {
    
    // Get speed corresponding to MOVE_STATE, increase by speed factor
    switch (this.MOVE_STATE) {
            
        case 'WALK':
            return this.walkSpeed * this.factorSpeed;
            //return this.walkSpeed;
            
        case 'JUMP ON':
            return this.jumpSpeed * this.factorSpeed;
            //return this.jumpSpeed;
        
        case 'JUMP OFF':
            return this.jumpSpeed * this.factorSpeed;
            //return this.jumpSpeed;
            
        case 'SURF':
            return this.surfSpeed * this.factorSpeed;
        
        case 'WALL WALK':
            return this.wallWalkSpeed * this.factorSpeed;
        
        case 'TURN':
            return this.turnSpeed * this.factorSpeed;
        
        case 'LADDER':
            return this.ladderSpeed;
    
    }
        
};

Player.prototype.parabolicMove = function(x) {
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

Player.prototype.interpolateMove = function() {
    
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
    
    else {
        // If player just finished jumping onto pokemon
        // Surf is begnning, reset surf ticks
        if (this.MOVE_STATE === 'JUMP ON') {
            // Reset surf counter 
            this.surfTicks = 0;
        }
        

        this.steps += 1;
       
       
        //this.startTile.floor.graphic.path.getContext('2d').moveTo();
        

        
        if (this.stopTile.ladder && !this.startTile.ladder) {
            
            this.MOVE_STATE = 'LADDER';
            
            
            //let endB = this.map.getOtherEndLadder(this.stopTile);
            this.setTile(this.stopTile);    
            this.setupMove();
            return;
        }
        
        // After using ladder, reset path on floor
        if (this.MOVE_STATE === 'LADDER') {
            this.game.resetPathPointer(this.startTile);
        }
        
//        // If path is still being followed
//        if (this.game.STATE === 'PATHFINDING') {
//            this.map.spoofDirection();
//        }
 
        this.setTile(this.stopTile); 
        this.MOVE_STATE = 'STILL';
        //console.log('I stopped moving');
         
        return;
    }    
    
};


Player.prototype.interpolateWalkSurf = function() {
    
    var current = this.current;
    var start = this.start;
    var displacement = this.displacement;
    var time = this.time;
    
    
    current.row = start.row + (displacement.row * time.percent);
    current.col = start.col + (displacement.col * time.percent);
    
};



Player.prototype.interpolateJump = function() {
    
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

Player.prototype.interpolateLadder = function() {
    
    var time = this.time;
    
    var formula_x = time.percent;   // Percentage through move
    
    // Transparency of transiton layer follows parabola
    var formula_y = this.parabolicMove(formula_x);   
    
    this.game.setTransitionOpacity(formula_y);
    //this.game.setTransitionAlpha(formula_y);   
    
    if (time.percent > .5 && (this.tile.id !== this.stopTile.id)) {
        this.setTile(this.stopTile);
    }
    
};





// Update the attributes associated with player that dictate sprite in use
Player.prototype.updateSpriteOptions = function() {
    
    // Update spriteOptions of various sprites
    // Player Options: GENDER - ACTIVITY - FACING - ORIENTATION
    // Pokemon Options: FACING - ORIENTATON
    // Dust Options: STAGE
    var playerOptions = this.playerOptions;
    var pokemonOptions = this.pokemonOptions;
    var dustOptions = this.dustOptions;
    
    // Update sprite gender
    //options.GENDER = this.game.GENDER;
    //playerOptions.GENDER = 'BOY'; 
    playerOptions.SHOW = true;
    
    if (this.MOVE_STATE === 'USER MOVE') {
        playerOptions.SHOW = false;
        return;
    }
    
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
            
            playerOptions.ACTIVITY = 'WALK';
            pokemonOptions.SHOW = false;
        }
        else if (this.time.percent < .9) {
            dustOptions.SHOW = true;
            dustOptions.STAGE = '2';
            
            playerOptions.ACTIVITY = 'WALK';
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


Player.prototype.initCanvas = function() {
    //var img = new Image();
    var game = this.game;
    
    var avatar = game.createCanvasCtx();
    
    avatar.canvas.width = game.getSpriteSize();
    avatar.canvas.height = game.getSpriteSize();
    
    this.avatar = avatar;
    
};



Player.prototype.drawToAvatarCanvas = function(img) {
    
    this.avatar.ctx.drawImage(img, 0, 0);
    
};



Player.prototype.drawPlayer = function(floor, dof) {
 
    var game = this.game;
    
    if (this.MOVE_STATE === 'DRAG') {
        this.drawDrag();
        return;
    }
 
    // Hide player during flood-fill
    if (this.game.getPathfinderState() === 'FRONTIER') {
        return;
    }
 

    if (this.game.getMapState() === 'GRAPHIC') {
        let currentTile = this.getCurrentTile();
        let floorId = currentTile.floor.id;
        let dof = currentTile.dof;
        game.drawShapeToScreen('circle', floorId, currentTile);
        return;
    }

    else if (this.game.getMapState() === 'BITMAP') {

        var tile = this.tile;
        var floorId = tile.floor.id;

        var row = this.current.row;
        var col = this.current.col;     
        
//        var tile_size = this.game.getTileSize();
        
        //let sprite_size = this.spritesheet.sprite_size;
        
        // Draw surf pokemon sprite
        if (this.pokemonOptions.SHOW) {
            
            let row;
            let col;
            
            // If he's jumping on, pokemon appear on end tile
            if (this.MOVE_STATE === 'JUMP ON') {
                let sprite = game.getSprite(this.pokemonOptions);
                let dof = this.stopTile.dof;
                game.drawImageToScreen(sprite.canvas, 'tile', floorId, dof, this.stopTile, 2);
                //game.drawSprite(this.pokemonOptions, this.stopTile);
            }    
            
            // If he's jumping off, pokemon appears on start tile
            else if (this.MOVE_STATE === 'JUMP OFF') {
                let sprite = game.getSprite(this.pokemonOptions);
                let dof = this.startTile.dof;
                //game.drawSprite(this.pokemonOptions, this.startTile);
                game.drawImageToScreen(sprite.canvas, 'tile', floorId, dof, this.startTile, 2);
            }
              
        }
        
        // Draw player sprite
        // Draw player on interpolated location
        let currentTile = this.getCurrentTile();
        let sprite = game.getSprite(this.playerOptions);
        let dof = currentTile.dof;
        game.drawImageToScreen(sprite.canvas, 'tile', floorId, dof, currentTile, 2);


        // Draw dust sprite  
        if (this.dustOptions.SHOW) { 
            // Draw dust on tile player is jumping to
            let sprite = game.getSprite(this.dustOptions);
            let dof = this.stopTile.dof;
            game.drawImageToScreen(sprite.canvas, 'tile',  floorId, dof, this.stopTile, 2);
            //game.drawSprite(this.dustOptions, this.stopTile);
            
        }
    }  
};

Player.prototype.startDrag = function($event) {

    var game = this.game;

    if (this.MOVE_STATE === 'STILL' &&
            game.getPathfinderState() === 'OFF') {
        
        game.setMonitorPointer($event);
        let pointerTile = game.getTileFromMonitorPointer();
        
        
        if (this.tile.id === pointerTile.id) {
            this.MOVE_STATE = 'DRAG';
        };     
    }
    
};

Player.prototype.updateDrag = function() {
    
    var game = this.game;
    
    var tile = game.getTileFromMonitorPointer();
 
    if (tile 
            && tile.type !== "ROCK"
            && !tile.obstacle) {
        
        this.dragTile = tile;
        
    }
    else {
        this.dragTile = null;
    }
    
};


Player.prototype.endDrag = function() {
    
    // Update sprite to hovertile (ie to draggie)
    if (this.MOVE_STATE === 'DRAG') {
        
        if (this.dragTile) {
            this.setTile(this.dragTile);
        }
        
        this.MOVE_STATE = 'STILL';
        
    }
    
};



Player.prototype.drawDrag = function() {
  
  // The player does not draw the drag sprite. It must be drawn by the monitor
  // because it has to go over several layers
  
  // So, instead, aquire the sprite that the monitor will use;
  this.headOptions.GENDER = this.playerOptions.GENDER;
  
  var dragSprite = this.game.getSprite(this.headOptions);
  this.game.drawImageToScreen(dragSprite.canvas, 'pointer', '', '', '', 2);

  //this.dragSprite = dragSprite;
  
  // However, can draw indicating square
  if (this.dragTile) {
      //this.game.drawShape('circle', this.dragTile);
      let dof = this.dragTile.dof;
      this.game.drawShapeToScreen('square', this.dragTile.floor.id, this.dragTile);
  }
    
};




Player.prototype.getPlayerSprites = function() {
 
    var game = this.game;
 
    var floor = this.tile.floor;
    var frame = floor.frame;
    
    var row = this.current.row;
    var col = this.current.col;     
    
    var tile_size = this.game.getTileSize();
    
    if (this.MOVE_STATE === 'USER MOVE') {
        return;
    }
    
    if (this.game.getLayerState() === 'GRAPHIC') {
        let x = col * tile_size + frame.offset_x - (.5 * tile_size);
        let y = row * tile_size + frame.offset_y - (.5 * tile_size);
        frame.ctx.drawImage(this.shape.canvas, x, y, tile_size, tile_size);
    }
    
    else if (this.game.getLayerState() === 'BITMAP') {
        
        //let sprite_size = this.spritesheet.sprite_size;
        var spriteArray = [];
        
        // Draw surf pokemon sprite
        if (this.pokemonOptions.SHOW) {
            
            let row;
            let col;
            
            // If he's jumping on, pokemon appear on stop tile
            if (this.MOVE_STATE === 'JUMP ON') {
                let sprite = game.getSprite(this.pokemonOptions);
                spriteArray.push([sprite, this.stopTile]);
            }    
            
            // If he's jumping off, pokemon appears on start tile
            else if (this.MOVE_STATE === 'JUMP OFF') {
                let sprite = game.getSprite(this.pokemonOptions);
                spriteArray.push([sprite, this.startTile]); 
            }
              
        }
        
        // Draw player sprite
        // Draw player on interpolated location
        let currentTile = this.getCurrentTile();
        let sprite = game.getSprite(this.playerOptions);
        spriteArray.push([sprite, currentTile]);
        
                

        // Draw dust sprite  
        if (this.dustOptions.SHOW) { 
            // Draw dust on tile player is jumping to
            let sprite = game.getSprite(this.dustOptions);
            spriteArray.push([this.dustOptions, this.stopTile]);
            
        }
        
        return spriteArray;
    }  
};


