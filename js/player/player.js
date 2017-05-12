var Player = function(game) {
    
    // Attach game object
    this.game = game;   
  
    // Sprite options for player
    this.playerOptions = {
        TYPE: 'PLAYER',
        GENDER: 'BOY',
        ACTIVITY: 'WALK',
        FACING: 'DOWN',
        ORIENTATION: 'STRAIGHT'
    };
    
    // Sprite options for surfing pokemon
    this.pokemonOptions = {
        TYPE: 'POKEMON',
        FACING: 'DOWN',
        ORIENTATION: 'DOWN'
    };
    
    // Sprite options for dust
    this.dustOptions = {
        TYPE: 'DUST',
        STAGE: 1
    };
    
    // Sprite options for head (for dragging)
    this.headOptions = {
        TYPE: 'HEAD',
        GENDER: 'BOY',
        FACING: 'DOWN'
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
    
    // Location of player
    this.tile = {};   
    
    // Time measures used for interpolation
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
    
    // Exact world position of player (can in between tiles)
    this.current = {
        row: null,
        col: null,
        floor: null
    };
    
    this.STATE = 'STILL';
    
};

//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

Player.prototype._________INITIALIZATION_________ = function() {};

// Initialize player object
Player.prototype.init = function(initial) {
   
    // Define player's initial location
    this.setTile(initial);   
};

//-------------------------------------//
/////////////////////////////////////////
// Mov
/////////////////////////////////////////
//-------------------------------------//

Player.prototype._________MOVE_METHODS_________ = function() {};

// Player update method
Player.prototype.updatePlayer = function() {
    
    var game = this.game;
    var STATE = this.STATE;
    
    // Update Player in Drag state
    if (STATE === 'DRAG') {
        this.updateDrag();
        return;
    }
    
    // Allow new move if player is standing still, or walking into wall
    if (STATE === 'STILL' ||
            STATE === 'WALL WALK') { 
        
        // Get direction from game
        if (game.getDirection()) {
            // Begin move
            this.setupMove();
        };     
    }
    
    // If player is currently moving
    if (STATE === 'WALK' || 
            STATE === 'SURF' || 
            STATE === 'JUMP ON' ||
            STATE === 'JUMP OFF' ||
            STATE === 'TURN' ||
            STATE === 'WALL WALK' ||
            STATE === 'LADDER') {
        
        // Continue interpolating move
        this.interpolateMove();
    } 
    
    // Update sprites to match current condition of player
    this.updateSpriteOptions();    
};

// Setup player move
Player.prototype.setupMove = function() {
    
    var game = this.game;
    
    // Get direction of input (or from Pathfinder)
    var direction = game.getDirection();

    // Get tile variables
    var startTile = this.tile;
    var floor = startTile.floor;
    var row = startTile.row;
    var col = startTile.col;  
    
    // Determine direction of movement
    var displacement = {
        row: 0,
        col: 0
    };
    
    if (direction === 'UP') {
        displacement.row = -1;  
    }
    else if (direction === 'DOWN') {
        displacement.row = +1; 
    }
    else if (direction === 'LEFT') {
        displacement.col = -1;
    }
    else if (direction === 'RIGHT') {
        displacement.col = +1;
    }
    
    //////////////////////
    // Consider each move state
    //////////////////////
    
    // ----- 1. Climbing ladder ----- //
    // You were sent here by the end of another move
    if (this.STATE === 'LADDER') {

        // Get start and stop tiles
        this.startTile = startTile;
        this.stopTile = game.getTileOtherEndLadder(startTile);
        
        
        // If Pathfinder is in 'FOLLOW PATH' mode
        if (game.getPathfinderMode() === 'FOLLOW PATH') {
            
            // Discard this move on input list
            this.game.pathfinder.inputDirectionList.shift();
        }
        
        // Update speed and time variables for interpolation
        var speed = this.getSpeed();
        this.time.total = 1/speed;
        this.time.start = new Date();
        
        // Interpolate move
        this.interpolateMove();
        return;        
    }
    
    // ----- 2. Turning ----- //
    // If player is still, and user direction does not match player direction
    // and Pathfinder is not active
    if (this.STATE === 'STILL' && game.getPathfinderMode() === 'OFF') {
        
        // A turn changes the direction of the player, but does not change his tile
        
        // Input direction and player direction are different
        if (direction !== this.playerOptions.FACING) {
            
            // Update player state
            this.STATE = 'TURN';
            
            // Update player's direction
            this.changeDirection(direction);
            
            // Reset surf counter
            this.surfTicks = 0;
            
            // Get start and stop tiles
            this.startTile = startTile;
            this.stopTile = startTile;
            
            // Update speed and time variables for interpolation
            var speed = this.getSpeed();
            this.time.total = 1/speed;
            this.time.start = new Date();
            
            // Interpolate move
            this.interpolateMove(); 
            return;
        }
    }
    
    
    // ----- 3a. Walking into Walls ----- //
    // If input direction is same as current player direction, continue walking into wall
    // Otherwise, interrupt and process user input
    if (this.STATE === 'WALL WALK') {      
        if (direction === this.playerOptions.FACING) { return; }      
    }
      
    // Determine final tile
    var stopTile = game.getTile(floor, row + displacement.row, col + displacement.col);
    
    // If tile is reachable
    if (stopTile 
            && game.hasEdge(startTile, stopTile) 
            && !stopTile.obstacle) {
        
        // Movement is admissable, begin interpolation 
        
        // Change player's direction
        this.changeDirection(direction);
        
        // Attach variables to object for interpolation
        this.startTile = startTile;
        this.stopTile = stopTile;
        this.start.row = row;
        this.start.col = col;
        this.displacement = displacement;
        
        // Set move state and determine time allotted for move
        var speed;
        
        // ----- 4. Jumping onto water pokemon ----- //
        if (startTile.type === 'LAND' && stopTile.type === 'WATER') {
            this.STATE = 'JUMP ON';    
        } 
        
        // ----- 5. Jumping off of water pokemon ----- //
        else if (startTile.type === 'WATER' && stopTile.type === 'LAND') {      
            this.STATE = 'JUMP OFF';
        }
        
        // ----- 6. Walking on land ----- //
        else if (startTile.type === 'LAND') {
            this.STATE = 'WALK';
        }
        
        // ----- 7. Surfing on water ----- //
        else if (startTile.type === 'WATER') {         
            this.STATE = 'SURF';
        }
        
        // Update speed and time variables for interpolation
        var speed = this.getSpeed();
        this.time.total = 1/speed;
        this.time.start = new Date();
        
        // Interpolate move
        this.interpolateMove();   
    }
    
    // ----- 3b. Walking into walls ----- //
    
    // Animate walking against wall
    else if (stopTile 
            && (!game.hasEdge(startTile, stopTile) || stopTile.obstacle)) {
        
        // Only animate walking into walls on land
        if(startTile.type === 'LAND') {

            // Update state
            this.STATE = 'WALL WALK';
            
            // Change player's direction
            this.changeDirection(direction);
            
            // Get variables for interpolation
            this.startTile = startTile;
            this.stopTile = startTile;
            
            // Update speed and time variables
            var speed = this.getSpeed();
            this.time.total = 1/speed;
            this.time.start = new Date();
            
            // Interpolate move
            this.interpolateMove();
        }       
    }   
};


// Interpolate various moves
Player.prototype.interpolateMove = function() {
    
    // Get progress through time
    var time = this.time;    
    this.time.delta = (new Date() - time.start)/1000;
    this.time.percent = time.delta/time.total;
    
    // If process is less than 100%
    if (this.time.percent < 1) {
        
        // If player is walking or surfing
        if (this.STATE === 'WALK' || this.STATE === 'SURF') {        
            this.interpolateWalkSurf();        
        }
        
        // If player is jumping
        else if (this.STATE === 'JUMP ON' || this.STATE === 'JUMP OFF') {          
            this.interpolateJump();           
        }
        
        // If player is climbing ladder
        if (this.STATE === 'LADDER') {
            this.interpolateLadder();
        }
    }
    
    //If progress is greater than 100% (interpolation is finished)
    else {
        
        // If player just finished jumping onto pokemon
        // Surf is begnning, reset surf ticks
        if (this.STATE === 'JUMP ON') {
            // Reset surf counter 
            this.surfTicks = 0;
        }
        
        // Increment player steps
        this.steps += 1;
       
        // Update player tile to stop tile
        this.setTile(this.stopTile);
       
        // If player just walked onto a ladder
        if (this.stopTile.ladder && !this.startTile.ladder) {
            
            // Begin ladder mode
            this.STATE = 'LADDER';
                     
            // Setup new move
            this.setupMove();
            return;
        }
      
        // Update player state
        this.STATE = 'STILL';
        
        // Redirect to Pathfinder, in case 'FOLLOW PATH' mode is actve
        this.game.updatePathfinder();
        
        // Redirect to player's update method, in case there's direction input from User
        this.updatePlayer();
        return;
    }       
};

// Parabolic functions used for specific interpolaton procedures
Player.prototype.parabolicMove = function(x) {
    
    // If you're jumping on, use a straightforward parabola to define movement
    // If you're jumping off, jumping should occur before 70% of move time
    
    // First parabolic function is also used to change opacity during floor transition
    
    var y;
    if (this.STATE === 'JUMP ON' || this.STATE === 'LADDER') {
        y = -4*Math.pow((x - 0.5),2) + 1;
    }
    else if (this.STATE === 'JUMP OFF') {
        y = Math.max((-8.16*Math.pow((x - 0.35),2) + 1), 0);
    }
    
    return y;  
};

// Interpolate walking and surfing
Player.prototype.interpolateWalkSurf = function() {
    
    // Get current tile (current location of player in between tiles)
    var current = this.current;
    
    // Get starting tile
    var start = this.start;
    
    // Update current position based on starting tile, displacement and time
    var displacement = this.displacement;
    var time = this.time;

    current.row = start.row + (displacement.row * time.percent);
    current.col = start.col + (displacement.col * time.percent);    
};


// Interpoalte jumping onto and off of pokemon
Player.prototype.interpolateJump = function() {
    
    // Get current tile (current location of player in between tiles)
    var current = this.current;
    
    // Get starting tile
    var start = this.start;
    var displacement = this.displacement;
    var time = this.time;
    
    // Percentage through move
    var formula_x = time.percent;  
    
    // Height w.r.t. time
    var formula_y = this.parabolicMove(formula_x);    
    
    // Is displacement positive or negative
    var sign = displacement.row + displacement.col;
    
    // If player is jumping on
    if (this.STATE === 'JUMP ON') {     
        var horizontal_displacement = sign * time.percent;
        var vertical_displacement = formula_y;
    }
    // If player is jumping off
    else if (this.STATE === 'JUMP OFF') {
        
        // If you're jumping off, increase horizontal displacement to compensate shortened jump
        // Player must spend last 30% of move standing still
        var horizontal_displacement = sign * Math.min(time.percent/.7, 1);
        var vertical_displacement = formula_y;
        
    }
        
    // If you're jumping across rows
    if (displacement.row !== 0) {
           
        current.row = start.row + horizontal_displacement - vertical_displacement;
        current.col = start.col;
            
    } 
    // Otherwise, if you're jumping across columns
    else if (displacement.col !== 0) {
            
        current.col = start.col + horizontal_displacement;
        current.row = start.row - vertical_displacement;
            
    }   
};

// Interpolate using a ladder
Player.prototype.interpolateLadder = function() {
    
    // Get time variable
    var time = this.time;
    
    // Percentage through move
    var formula_x = time.percent;   
    
    // Transparency of transiton layer follows parabola
    var formula_y = this.parabolicMove(formula_x);   
    
    // Update opacity of transition layer on game
    // Used by monitor and gameboyw
    this.game.setTransitionOpacity(formula_y);
    
    // Move player to stop tile at halfway point
    if (time.percent > .5 && (this.tile.id !== this.stopTile.id)) {
        this.setTile(this.stopTile);
    }  
};

// Get player's speed based on state and speed setting
Player.prototype.getSpeed = function() {
    
    // Get speed corresponding to STATE, increase by speed factor
    switch (this.STATE) {
            
        case 'WALK':
            return this.walkSpeed * this.factorSpeed;
            
        case 'JUMP ON':
            return this.jumpSpeed * this.factorSpeed;
        
        case 'JUMP OFF':
            return this.jumpSpeed * this.factorSpeed;
            
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

// Change player's direction
Player.prototype.changeDirection = function(direction) {
    this.playerOptions.FACING = direction;
};

//-------------------------------------//
/////////////////////////////////////////
// Tile Methods
/////////////////////////////////////////
//-------------------------------------//

Player.prototype._________TILE_METHODS_________ = function() {};


// Set tile of player
Player.prototype.setTile = function(tile) {
    
    // Store previous tile
    var prevTile = this.tile;
    
    // Update current tile
    this.tile = tile;
    this.current.row = tile.row;
    this.current.col = tile.col;
    this.current.floor = tile.floor;
    
    // If he's entering water, reset surf counter
    if (prevTile && prevTile.type === 'LAND' && tile.type === 'WATER') { 
        this.surfTicks = 0;
    }
    
};

// Get current tile
Player.prototype.getCurrentTile = function() {
    return {
        row: this.current.row,
        col: this.current.col,
        floor: this.tile.floor,
        dof: this.tile.dof
    };
};



//-------------------------------------//
/////////////////////////////////////////
// Draw Methods
/////////////////////////////////////////
//-------------------------------------//

Player.prototype._________DRAW_METHODS_________ = function() {};

// Draw player to screen
Player.prototype.drawPlayer = function() {
 
    var game = this.game;
    
    if (this.STATE === 'DRAG') {
        this.drawDrag();
        return;
    }
 
    // Hide player when Pathfinder is in FRONTIER mode
    if (this.game.getPathfinderMode() === 'FRONTIER') {
        return;
    }
 
    // If map is in GRAPHIC state
    if (this.game.getMapState() === 'GRAPHIC') {
        
        // Get tile information
        let currentTile = this.getCurrentTile();
        let floorId = currentTile.floor.id;
        let dof = currentTile.dof;
        
        // Draw shape to screen
        game.drawShapeToScreen('circle', floorId, currentTile);
        return;
    }

    // If map is in BITMAP state
    else if (this.game.getMapState() === 'BITMAP') {

        // Get tile information
        var tile = this.tile;
        var floorId = tile.floor.id;

        var row = this.current.row;
        var col = this.current.col;     
       
       
        // Draw surf pokemon sprite
        if (this.pokemonOptions.SHOW) {
            
            let row;
            let col;
            
            // If he's jumping on, pokemon appears on stop tile
            if (this.STATE === 'JUMP ON') {
                
                // Get depth-of-field
                let dof = this.stopTile.dof;
                
                let options = {
                    image: 'spritesheet', 
                    target: 'tile',
                    floorId: floorId,
                    dof: dof,
                    tile: this.stopTile,
                    span: 2,
                    spriteOptions: this.pokemonOptions
                };
                
                game.drawImageToScreen(options);
            }    
            
            // If he's jumping off, pokemon appears on start tile
            else if (this.STATE === 'JUMP OFF') {
                
                // Get depth-of-field
                let dof = this.startTile.dof;
                
                let options = {
                    image: 'spritesheet', 
                    target: 'tile',
                    floorId: floorId,
                    dof: dof,
                    tile: this.startTile,
                    span: 2,
                    spriteOptions: this.pokemonOptions
                };
                
                game.drawImageToScreen(options);
            }            
        }
        
        // Draw player sprite at interpolated location
        let currentTile = this.getCurrentTile();
        let dof = currentTile.dof;
        
        // Move player to foreground if current or stop tile is 'pre-stairs'
        // Player should be on foreground if tile is in front of stairs (which are foreground)
        // Improves visuals for Pathfinder Path and Frontier layers
        if (this.tile.prestairs || (this.stopTile && this.stopTile.prestairs)) {
            dof = 'FOREGROUND';
        }
        
        let options = {
            image: 'spritesheet',
            target: 'tile',
            floorId: floorId,
            dof: dof,
            tile: currentTile,
            span: 2,
            spriteOptions: this.playerOptions
        };

        game.drawImageToScreen(options);
        
        // Draw dust sprite on tile payer is jumping to
        if (this.dustOptions.SHOW) { 
            
            let dof = this.stopTile.dof;
            
            let options = {
                image: 'spritesheet', 
                target: 'tile',
                floorId: floorId,
                dof: dof,
                tile: this.stopTile,
                span: 2,
                spriteOptions: this.dustOptions
            };
            
            game.drawImageToScreen(options);
        }
    }  
};


// Update the attributes associated with player that dictate sprite in use
Player.prototype.updateSpriteOptions = function() {
    
    ////////////////////////////////////////////////////
    // Update spriteOptions of various sprites
    // Player Options: GENDER - ACTIVITY - FACING - ORIENTATION
    // Pokemon Options: FACING - ORIENTATON
    // Dust Options: STAGE
    ////////////////////////////////////////////////////
    
    var playerOptions = this.playerOptions;
    var pokemonOptions = this.pokemonOptions;
    var dustOptions = this.dustOptions;
    
    // Show player by  
    playerOptions.SHOW = true;
   
    // If jumping onto pokemon
    if (this.STATE === 'JUMP ON') {
        
        // Hide dust
        dustOptions.SHOW = false;
        
        // Update pokemon sprite options
        pokemonOptions.SHOW = true;
        pokemonOptions.FACING = playerOptions.FACING;
        
        // Update player sprite options
        playerOptions.ACTIVITY = 'JUMP'; 
        playerOptions.ORIENTATION = 'STRAIGHT';        
    }
    
    // If player is jumping off
    else if (this.STATE === 'JUMP OFF') {
        
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
        
        //////////////////
        // Refine dust, player and sprite 
        // based on progress through move
        //////////////////
        
        // Dust shown/pokemon presence is based on progress through jump move
        if (this.time.percent < .7) {  
            dustOptions.SHOW = false;
        }
        else if (this.time.percent <= .8) {
            dustOptions.SHOW = true;         
            dustOptions.STAGE = '1';
            
            playerOptions.ACTIVITY = 'WALK';
            pokemonOptions.SHOW = false;
        }
        else if (this.time.percent <= .9) {
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
    
    // If player is on land
    else if (this.tile.type === 'LAND') {
        
        // Hide dust and pokemon
        dustOptions.SHOW = false;
        pokemonOptions.SHOW = false;
        
        // If he's still
        if (this.STATE === 'STILL') {
                     
            playerOptions.ACTIVITY = 'WALK'; 
            playerOptions.ORIENTATION = 'STRAIGHT';
            
        }    
        
        // Otherwise
        else if (this.STATE === 'WALK' ||
                this.STATE === 'WALL WALK' ||
                this.STATE === 'TURN') {
            
            playerOptions.ACTIVITY = 'WALK';
            
            // Use run sprite if speed is high
            if (this.STATE === 'WALK' && this.factorSpeed > 1) {
                playerOptions.ACTIVITY = 'RUN';
            }
            
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
        
    // If he's on water
    else if (this.tile.type === 'WATER') { 
        
        // Hide dust and pokemon
        dustOptions.SHOW = false;
        pokemonOptions.SHOW = false;
        
        playerOptions.ACTIVITY = 'SURF';         
    
        // Orientation based on surf ticks
        if (this.surfTicks < 60) {
            playerOptions.ORIENTATION = 'UP';
        } else {
            playerOptions.ORIENTATION = 'DOWN';
        }
        
        this.surfTicks ++;
        this.surfTicks %= 120;
    
    }; 
};


//-------------------------------------//
/////////////////////////////////////////
// Drag Methods
/////////////////////////////////////////
//-------------------------------------//


Player.prototype._________DRAG_METHODS_________ = function() {};


// Start player drag
Player.prototype.startDrag = function() {

    var game = this.game;

    // If player is STILl and Pathfinder is OFF
    if (this.STATE === 'STILL' &&
            game.getPathfinderMode() === 'OFF') {
        
        // Get tile from monitor pointer
        let pointerTile = game.getTileFromMonitorPointer();
        
        // Start drag if pointer and player location are the same
        if (this.tile.id === pointerTile.id) {
            this.STATE = 'DRAG';
        };     
    }   
};

// Update player drag
Player.prototype.updateDrag = function() {
    
    var game = this.game;
    
    // Get tile from monitor pointer
    var tile = game.getTileFromMonitorPointer();
 
    // If tile is valid
    if (tile 
            && tile.type !== "ROCK"
            && !tile.obstacle) {
        
        // Update drag tile to that tile
        this.dragTile = tile;       
    }
    else {
        this.dragTile = null;
    }
    
};

// End player drag
Player.prototype.endDrag = function() {
    
    // Update sprite to dragTile
    if (this.STATE === 'DRAG') {
        
        if (this.dragTile) {
            this.setTile(this.dragTile);
        }
        
        // End Drag state
        this.STATE = 'STILL';        
    }
};


// Draw drag animation
Player.prototype.drawDrag = function() {
  
    // The player does not draw the drag sprite. It must be drawn by the monitor
    // because it has to go over several layers
  
    // So, instead, aquire the sprite that the monitor will use;
    this.headOptions.GENDER = this.playerOptions.GENDER;
 
    // And send to screen to draw
    let options = {
        image: 'spritesheet',
        spriteOptions: this.headOptions,
        target: 'pointer', 
        span: 2
    };
    
    this.game.drawImageToScreen(options);
  
    // However, can draw indicating square
    if (this.dragTile) {
        let dof = this.dragTile.dof;
        this.game.drawShapeToScreen('square', this.dragTile.floor.id, this.dragTile);
    };
};


