var UserConsole = function(game) {
    
    // Attach game object
    this.game = game;
    
    //////////////////////
    // Algorithms
    /////////////////////
    
    // Avaialble algorithms
    this.algorithms = {};
    
    this.algorithms.options = {
        0: {
            id: 0,
            label: 'Breadth-first search',
            method: 'bfs'
        },
        1: {
            id: 1,
            label: 'Depth-first search',
            method: 'dfs'
        },
        2: {   
            id: 2,
            label: 'Dijkstra\'s',
            method: 'dijkstras'
        },
        3: {
            id: 3,
            label: 'A*',
            method: 'astar'
            
        }
    };   
    
    this.algorithms.selected = this.algorithms.options[0];
    
    //////////////////////
    // Source/Target Locations
    /////////////////////
    
    // Available locations
    this.locations = {};
    this.locations.options = [
        {
            id: 0,
            label: 'Current Player Tile'
        },
        {
            id: 1,
            label: 'Entrance',
            keyTile: 0
        },
        {   
            id: 2,
            label: 'Mewtwo',
            obstacle: 0
        },
        {
            id: 3,
            label: 'Random Tile'
        },
        {
            id: 4,
            label: 'Current Marker'
        },
        {
            id: 5,
            label: 'All Tiles'
        }          
    ];
    
    this.locations.source = this.locations.options[1];
    this.locations.target = this.locations.options[2];
    
    // Activity Log messages
    this.activity = {      
        content: 'Default message',
        log: []       
    };
    
    //////////////////////
    // Edge Weight Visualization Layers
    /////////////////////
    
    // Edge weights for slider
    
    this.edgeweight = {
        background: 1,
        foreground: 10,
        water: 20 ,
        min: 1,
        max: 30
    };
        
    // Time measures used for interpolation of weight layers
    this.time = {
        start: null,
        total: null,
        delta: null,
        percent: null,
        speed: .6
    };
    
    // Weight layer color
    this.hexWeightLayer = "#FFEB3B";
    
    // Flag indicating if weight has changed
    this.WEIGHT_CHANGE = null;
    
    // Store a layer for each floor
    this.floors = {};
    
    //////////////////////
    // Point Marker Buttons
    /////////////////////
    
    // Hide point markers by default
    this.pointmarker = {
        source: {
            show: false,
            button: {
                active: false,
                disabled: false
            },
            checkbox: {
                active: false,
                disabled: false
            }
        },
        target: {
            show: false,
            button: {
                active: false,
                disabled: false
            },
            checkbox: {
                active: false,
                disabled: false
            }
        }
    };
    
    //////////////////////
    // Pathfinder Task and Layer Buttons
    /////////////////////
    
    this.pathfinder = {
        state: null,
        task: {
            path: {
                button: {
                    active: false,
                    disabled: false
                }
            },
            frontier: {
                button: {
                    active: false,
                    disabled: false
                }
            }
        },
        layer: {
            path: {
                show: false,
                button: {
                    hover: false,
                    click: false,
                    active: false,
                    disabled: false
                }    
            },
            frontier: {
                show: false,
                button : {
                    hover: false,
                    click: false,
                    active: false,
                    disabled: false
                }
            }
        }
    };
        
    //////////////////////
    // VCR Buttons
    /////////////////////
    
    this.vcr = {
        command: null,
        button: {
            play: {
                active: false,
                disabled: false
            },
            pause: {
                active: false,
                disabled: false
            },
            step: {
                active: false,
                disabled: false
            }
        }
    };
    
    //////////////////////
    // Map State buttons
    //////////////////////
    
    this.map = {
        state: 'BITMAP',
        button: {
            click: 'BITMAP',
            hover: null
        }
    };
    
    //////////////////////
    // Grid layers
    //////////////////////
    
    this.grid = {
        layer: false
    };
    
    //////////////////////
    // Speed buttons
    //////////////////////
    
    this.speed = {
        button: {
            click: 1,
            hold: null
        }
    };
    
    //////////////////////
    // Gender buttons
    /////////////////////
    
    this.gender = {
        button: {
            click: 'BOY',
            hold: null
        }
    };
    
    //////////////////////
    // Current Game direction 
    //////////////////////   
    
    this.direction = {
        button: null
    };
    
    this.input = {
        direction: null
    };
    
};



//-------------------------------------//
/////////////////////////////////////////
// Itialization
/////////////////////////////////////////
//-------------------------------------//

// Initialize User Console
UserConsole.prototype.init = function() {   
    // Initialize Weight Layers
    this.initWeightLayers();
};

//-------------------------------------//
/////////////////////////////////////////
// Update Settings
/////////////////////////////////////////
//-------------------------------------//

// Update User Console settings (once each frame)
UserConsole.prototype.updateSettings = function() {
    
    // Get game object
    var game = this.game;
    
    // Get Pathfinder buttons object
    var pathfinder = this.pathfinder;
    
    // Get current Pathfinder state
    pathfinder.mode = game.getPathfinderMode();
    
    // Update buttons and game based on various conditions
    this.updatePointMarkerSettings();
    this.updatePathfinderTaskButtonSettings();  
    this.updatePathfinderLayerButtonSettings();  
    this.updateSpeedSettings();  
    this.updateGenderSettings();
    this.updateVCRButtonSettings();

};


// Update Point Marker buttons and checkboxes
UserConsole.prototype.updatePointMarkerSettings = function() {
    
    var pathfinder = this.pathfinder;
    
    // Activate checkboxes if point markers are showing
    this.pointmarker.source.checkbox.active = this.pointmarker.source.show;
    this.pointmarker.target.checkbox.active = this.pointmarker.target.show;
    
    //--------------------->
    // Source Point Marker Settings
    //--------------------->
    
    // If User is moving Source PointMarker
    if (pathfinder.mode === 'PLACE SOURCE' ||
          pathfinder.mode === 'DRAG SOURCE') {
        
        // Pointmarker button is active
        this.pointmarker.source.button.active = true;
        
        // Checkbox is disabled and inactive
        this.pointmarker.source.checkbox.disabled = true;
        this.pointmarker.source.checkbox.active = false;       
    } 
    
    // If Pathfinder is in 'FOLLOW PATH' or 'FRONTIER' modes,
    // Cannot move pointmarker
    else if (pathfinder.mode === 'FOLLOW PATH' ||
            pathfinder.mode === 'FRONTIER') {
        
        // Pointmarker button is disabled
        this.pointmarker.source.button.acive = false;
        this.pointmarker.source.button.disabled = true;      
        
    } 
    // If Pathfinder is not in above modes
    else {
        // Button is enabled, but inactive
        this.pointmarker.source.button.disabled = false; 
        this.pointmarker.source.button.active = false;
        
        // Checkbox is enabled
        this.pointmarker.source.checkbox.disabled = false;
    }
    
    //--------------------->
    // Target Point Marker Settings
    //--------------------->
    
    // If User is moving Target Point Marker
    if (pathfinder.mode === 'PLACE TARGET' ||
            pathfinder.mode === 'DRAG TARGET') {
        // Pointmarker button is active
        this.pointmarker.target.button.active = true;
        
        // Checkbox is disabled and inactive
        this.pointmarker.target.checkbox.disabled = true;
        this.pointmarker.target.checkbox.active = false;
    } 
    // If Pathfinder is in FOLLOW PATH or FRONTIER modes
    // Cannot move pointmarker when pathfinder is active
    else if (pathfinder.mode === 'FOLLOW PATH' ||
            pathfinder.mode === 'FRONTIER') {
        
        // Pointmarker button is disabled
        this.pointmarker.target.button.acive = false;
        this.pointmarker.target.button.disabled = true;      
        
    } 
    // If Pathfinder is not in above states
    else {
        // Button is enabled, but inactive
        this.pointmarker.target.button.disabled = false; 
        this.pointmarker.target.button.active = false;
        
        // Checkbox is enabled
        this.pointmarker.target.checkbox.disabled = false;
    }
    
    
    // Hide and disable target pointmarker if "all tiles" is target tile
    if (this.locations.target.id === 5) {
        this.pointmarker.target.show = false;
        this.pointmarker.target.checkbox.disabled = true;
        this.pointmarker.target.checkbox.active = false;
    }
    
};

// Update Pathfinder Task buttons
UserConsole.prototype.updatePathfinderTaskButtonSettings = function() {
    
    var pathfinder = this.pathfinder;
    
    // Enable pathfinder task buttons by default
    pathfinder.task.path.button.disabled = false;
    pathfinder.task.frontier.button.disabled = false;
    
    // Turn 'PATH' button on/off
    if (pathfinder.mode === 'FOLLOW PATH') {
        pathfinder.task.path.button.active = true;
    } else {
        pathfinder.task.path.button.active = false;
    }
    
    // Turn 'FRONTIER' button on/off
    if (pathfinder.mode === 'FRONTIER') {
        pathfinder.task.frontier.button.active = true;
    } else {
        pathfinder.task.frontier.button.active = false;
    }
    
    // Disable path task button if "all tiles" is target tile
    // and Pathfinder is not currently in 'FOLLOW PATH' mode
    if (this.locations.target.id === 5 &&
            pathfinder.mode !== 'FOLLOW PATH') {
        pathfinder.task.path.button.disabled = true;
    }
    
};

// Update Pathfinder Layer buttons
UserConsole.prototype.updatePathfinderLayerButtonSettings = function() {
    
    var pathfinder = this.pathfinder;
    var game = this.game;
    
    // Loop through and update pathfinder layer
    for (let l in pathfinder.layer) {
        
        // Get and captalize the layer name
        let layer = pathfinder.layer[l];
        let LAYER = l.toUpperCase();
        
        
        // Check with Pathfinder to see if layer exists
        // If so, enable      
        if (game.hasPathfinderLayer(LAYER)) {
            layer.button.disabled = false;       
        } else {
            layer.button.disabled = true;
            layer.button.active = false;
            continue;
        } 
        
        // If button was cliced
        if (layer.button.click) {
            
            // Either show or unshow
            layer.button.active = !layer.button.active;
            layer.show = layer.button.active;
            
            // Un-click and un-hover
            layer.button.click = false; 
            layer.button.hover = false;
            
        } 
        // If hovering over button, show layer
        else if (layer.button.hover) {
            layer.show = true;       
        } 
        // If button is already active
        // Show layer
        else if (layer.button.active) {           
            layer.show = true;          
        }
        // Otherwise, hide layer
        else {
            // Default setting
            layer.show = false; 
        }        
    } 
};

// Update Game Speed based on Speed button
UserConsole.prototype.updateSpeedSettings = function() {
    
    // If user is 'holding' button
    if (this.speed.button.hold) {
        // Update game wtih the 'hold' speed
        this.game.setPlayerSpeed(this.speed.button.hold);
    }
    else {
        // Update game with the 'click' speed
        this.game.setPlayerSpeed(this.speed.button.click);
    }
    
};

// Update Game Gender based on Gender button
UserConsole.prototype.updateGenderSettings = function() {
    
     // If user is 'holding' button
    if (this.gender.button.hold) {
        // Update game with the 'hold' gender
        this.game.setPlayerGender(this.gender.button.hold);
    }
    else {
        // Update game with the 'click' gender
        this.game.setPlayerGender(this.gender.button.click);
    }
      
};

// Update VCR buttons
UserConsole.prototype.updateVCRButtonSettings = function() {
    
    var pathfinder = this.pathfinder;
    var vcr = this.vcr;
    
    // Turn VCR off if pathfinder is off
    if (pathfinder.mode === 'OFF') {
        vcr.command = null;
    }
    
    //Loop through and update VCR buttons
    for (let b in vcr.button) {
        
        // Deactivate and enable by default
        vcr.button[b].active = false;
        vcr.button[b].disabled = false;
        
        // Capitalize button to match command
        var B = b.toUpperCase();
        
        // Disable each button if VCR command is null (VCR is inactive)
        if (vcr.command === null) {
            vcr.button[b].disabled = true;
        }
        
        // Active pause button if user has pressed 'STEP'
        else if (vcr.command === 'STEP' &&
                B === 'PAUSE') {
            vcr.button[b].disabled = false;
            vcr.button[b].active = true;
        }
        // Activate button that user as pressed
        else if (vcr.command === B) {
            vcr.button[b].disabled = false;
            vcr.button[b].active = true;
        };
    }    
};


//-------------------------------------//
/////////////////////////////////////////
// Algorithm Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype.getSelectedAlgorithm = function() {
    return this.algorithms.selected;
};

UserConsole.prototype.setSelectedAlgorithm = function(algorithm) {
    this.algorithms.selected = algorithm;
};

UserConsole.prototype.getAlgorithms = function() {
    return this.algorithms.options;
};

//-------------------------------------//
/////////////////////////////////////////
// Source/Target Location Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype.____Source_Target_Location_Methods____ = function() {};

UserConsole.prototype.getLocations = function() {
    return this.locations.options;
};

UserConsole.prototype.getSourceLocation = function() {
    return this.locations.source;
};

UserConsole.prototype.setSourceLocation = function(location) {
    this.locations.source = location; 
    
    // Show source pointmarker after switching to 'Current Marker' option
    if (location.id === 4) {
        this.pointmarker.source.show = true;
    }
};

UserConsole.prototype.getTargetLocation = function() {
    return this.locations.target;
};

UserConsole.prototype.setTargetLocation = function(location) {
    this.locations.target = location;  
    
    // Show target pointmarker after switching to 'Current Marker' option
    if (location.id === 4) {
        this.pointmarker.target.show = true;
    }
};

UserConsole.prototype.setLocationTile = function(sourceTarget, id) {
    
    
    if (sourceTarget === 'SOURCE') {
        this.locations.source = this.locations.options[id];
    }
    else if (sourceTarget === 'TARGET') {
        this.locations.target = this.locations.options[id];
    }
    
};

UserConsole.prototype.getLocationTile = function(sourceTarget) {
    
    var game = this.game;
    
    var location;
    if (sourceTarget === 'SOURCE') {
        location = this.locations.source;
    }
    else {
        location = this.locations.target;
    }
    
    // If Console tile is Player Tile
    if (location.id === 0) {
        tile = game.getPlayerTile();
    }
    // If console tile is Entrance
    else if (location.id === 1) {
        var keyTileId = location.keyTile;
        tile = game.getKeyTile(keyTileId);
    }  
    // If console tile is Mewtwo
    else if (location.id === 2) {
        var obId = location.obstacle;
        tile = game.getObstacle(obId);   
    }
    else if (location.id === 3) {
        tile = game.getRandomTile();       
    }
    else if (location.id === 4) {
        tile = game.getPointMarkerTile(sourceTarget);
    }
    else if (location.id === 5) {
        tile = game.getPointMarkerTile(sourceTarget);
    }
    
    return tile;
    
};

UserConsole.prototype.targetTileIsAll = function() {
    // Return true if target location is set to 'All Tiles'
    return this.locations.target.id === 5;   
};


//-------------------------------------//
/////////////////////////////////////////
// Pathfinder Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Pathfinder_Methods_________ = function() {};

UserConsole.prototype.startPathfinder = function(state) {    
    this.game.startPathfinder(state);    
};

UserConsole.prototype.clearPathfinder = function() {
    this.game.clearPathfinder();    
};

UserConsole.prototype.getPathfinderState = function() {
    return this.pathfinder.mode;
};


//-------------------------------------//
/////////////////////////////////////////
// VCR Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________VCR_Methods_________ = function() {};

UserConsole.prototype.getVCR = function() {
    return this.vcr;
};

UserConsole.prototype.handleVCRCommand = function(command) {
    
    if (this.pathfinder.mode !== 'FOLLOW PATH'  &&
            this.pathfinder.mode !== 'FRONTIER') {
        return;
    }
    
    var vcr = this.vcr;
    
    // Update VCR with current command
    if (command === 'PLAY') {
        vcr.command = 'PLAY';
    }
    
    else if (command === 'PAUSE') {
        vcr.command = 'PAUSE';
    }
    
    else if (command === 'STEP') {
        vcr.command = 'STEP';
    }
    
};

UserConsole.prototype.getVCRCommand = function() {
    return this.vcr.command;
};

UserConsole.prototype.setVCRCommand = function(command) {
    this.vcr.command = command;
};



//-------------------------------------//
/////////////////////////////////////////
// Point Marker Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________PointMarker_Methods_________ = function() {};

UserConsole.prototype.isPointMarkerVisible = function(point) {
    
    var marker;
    if (point === 'SOURCE') {
       marker = this.pointmarker.source;
    }
    
    else if (point === 'TARGET') {
       marker = this.pointmarker.target;
    }
    
    return marker.show;
    
};

UserConsole.prototype.showPointMarker = function(point, show) {
    
    var marker;
    if (point === 'SOURCE') {
       marker = this.pointmarker.source;
    }
    
    else if (point === 'TARGET') {
       marker = this.pointmarker.target;
    }
    
    marker.show = show;
    
};


UserConsole.prototype.enablePointMarker = function(point, enable) {
    
    var marker;
    if (point === 'SOURCE') {
       marker = this.pointmarker.source;
    }
    
    else if (point === 'TARGET') {
       marker = this.pointmarker.target;
    }
    
    marker.disabled = !enable;
    
};


UserConsole.prototype.getPointMarker = function(point) {
    
    if (point === 'SOURCE') {
        return this.pointmarker.source;
    }
    
    else if (point === 'TARGET') {
        return this.pointmarker.target;
    }
    else {
        return this.pointmarker;
    }
    
};


UserConsole.prototype.getPointMarkerButton = function(point) {
    
    if (point === 'SOURCE') {
        return this.pointmarker.source.button;
    }
    
    else if (point === 'TARGET') {
        return this.pointmarker.target.button;
    }
    
};

UserConsole.prototype.getPointMarkerCheckbox = function(point) {
    
    if (point === 'SOURCE') {
        return this.pointmarker.source.checkbox;
    }
    
    else if (point === 'TARGET') {
        return this.pointmarker.target.checkbox;
    }
    
};


UserConsole.prototype.togglePointMarker = function(point) {
  
    var game = this.game;
    var pointmarker;
    
    if (point === 'SOURCE') {
        pointmarker = this.pointmarker.source;
    } else {
        pointmarker = this.pointmarker.target;
    }
    
    if (pointmarker.checkbox.disabled) {
        return;
    }
    
    else {
        var status = pointmarker.show;
        pointmarker.show = !status;
        return;
    }
        
};


//-------------------------------------//
/////////////////////////////////////////
// Pathfinder Layer Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Pathfinder_Layer_Methods_________ = function() {};

UserConsole.prototype.getPathfinderLayer = function(selection) {
    
    if (selection === 'FRONTIER') {
        return this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.layer.path;
    }
    
    return this.pathfinder.layer;
    
};

UserConsole.prototype.togglePathlayer = function(button) {
   
    if (this.game.pathfinder.LAYER !== 'PATH') {       
        this.pathlayer.on = false;
        this.pathlayer.disabled = true;        
    }  
    
    else if (button.click) {          
        this.pathlayer.on = !button.active;
        this.pathlayer.disabled = false;
        
    }   
    
    else if (button.hover) {
        this.pathlayer.on = true;
        this.pathlayer.disabled = false;   
    }

    
    else if (!button.active && !button.hover) {
        this.pathlayer.on = false;
        this.pathlayer.disabled = false;
    }
    
    return this.pathlayer;
    
};


UserConsole.prototype.enablePathfinderLayerButton = function(selection, bool) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    layer.button.disabled = !bool;
};

UserConsole.prototype.activatePathfinderLayerButton = function(selection, bool) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    layer.button.disabled = !bool;
    layer.button.active = bool;
};


UserConsole.prototype.togglePathfinderLayerButton = function(action, selection) {
    
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    if (!this.game.hasPathfinderLayer(selection)) { 
        return; 
    }
    
    else if (action === 'hover') {
        layer.button.hover = true;
    }   
    else if (action === 'click') {
        layer.button.click = !layer.button.click;
    }      
    else {
        layer.button.hover = false;
        layer.button.click = false;
    }

};

UserConsole.prototype.showPathfinderLayer = function(selection, bool) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    layer.show = bool;
};



UserConsole.prototype.isPathfinderLayerVisible = function(selection) {
    
    if (selection === 'FRONTIER') {
        return this.pathfinder.layer.frontier.show;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.layer.path.show;
    }
    
};



//-------------------------------------//
/////////////////////////////////////////
// Pathfinder Task Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Pathfinder_Task_Methods_________ = function() {};


UserConsole.prototype.getPathfinderTaskButtons = function(selection) {

    if (selection === 'FRONTIER') {
        return  this.pathfinder.task.frontier;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.task.path;
    }
    
    return this.pathfinder.task;
    
};


//-------------------------------------//
/////////////////////////////////////////
// Edge Weight Layer Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Edge_Weight_Layer_Methods_________ = function() {};


UserConsole.prototype.getEdgeWeights = function() {
    return this.edgeweight;
};


UserConsole.prototype.initWeightLayers = function() {
    
    var game = this.game;
    var mapFloors = game.getFloors();
    
    // Create a canvas object for each floor in the map
    for (let f in mapFloors) {
        
        
        var mapFloor = mapFloors[f];
        var id = mapFloor.id;
        
        var floor = {
            weightlayer: {}
        };
        
        var width = mapFloor.background.img.width;
        var height = mapFloor.background.img.height;
        var tile_size = width/mapFloor.cols;
        
        var canvas_size = {
            width: width,
            height: height
        };
        
        // Create foreground, background and water layers for each floor
        var background = game.createCanvasCtx(canvas_size);
        background.canvas.width = width;
        background.canvas.height = height;
        
        var foreground = game.createCanvasCtx(canvas_size);        
        foreground.canvas.width = width;
        foreground.canvas.height = height;
        
        var water = game.createCanvasCtx(canvas_size);        
        water.canvas.width = width;
        water.canvas.height = height;
        
        
        
        floor = {
            weightlayer: {
                background: background,
                foreground: foreground,
                water: water
            },
            tile_size: tile_size,
            rows: mapFloor.rows,
            cols: mapFloor.cols
        };
        
        
        // Draw rectangles on layers
        background.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        foreground.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        water.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';     
        
        // Create various edge weight layers
        for (let r = 0; r < floor.rows; r++) {
            for (let c = 0; c < floor.cols; c++) {
                
                let tile = mapFloor.getTile(r, c);
                let x = c * tile_size;
                let y = r * tile_size;
                
                if (tile.dof === 'BACKGROUND' 
                        && tile.type !== 'WATER'
                        && tile.type !== 'ROCK') {
                    background.ctx.fillRect(x, y, tile_size, tile_size);
                }
                else if (tile.dof === 'FOREGROUND'  
                        && tile.type !== 'WATER'
                        && tile.type !== 'ROCK') {
                    foreground.ctx.fillRect(x, y, tile_size, tile_size);
                }
                else if (tile.type === 'WATER') {
                    water.ctx.fillRect(x, y, tile_size, tile_size);
                }
                
                
            }
            
        }
        
        this.floors[id] = floor;
        
    }      
};



UserConsole.prototype.drawWeightLayers = function(floorId) {
    
    if (!this.WEIGHT_CHANGE) { return; }
    
    // Determine alpha based on time
    var time = this.time;
    this.time.delta = (new Date() - time.start)/1000;    
    this.time.percent = time.delta/time.total; 
    var alpha = time.percent;
    
    var floor = this.floors[floorId];
    
    var layer;
    var dof;
    if (this.WEIGHT_CHANGE === 'BACKGROUND') {
        layer = floor.weightlayer.background;
        dof = 'BACKGROUND';
    }
    else if (this.WEIGHT_CHANGE === 'FOREGROUND') {
        layer = floor.weightlayer.foreground;
        dof = 'FOREGROUND';
    }
    else if (this.WEIGHT_CHANGE === 'WATER') {
        layer = floor.weightlayer.water;
        dof = 'BACKGROUND';
    }
    
    let options = {
        image: layer.canvas,
        target: 'floor',
        floorId: floorId,
        dof: dof,
        alpha: alpha
    };
    
    this.game.drawImageToScreen(options);

    if (time.percent >= .95) {
        this.WEIGHT_CHANGE = null;
    }
};




UserConsole.prototype.determineEdgeWeightChange = function(newValue, oldValue) {
    
    var difference = 0;
    
    for (var layer in newValue) {
        difference = newValue[layer] - oldValue[layer];
        if ((difference) !== 0) {
            break;
        } 
    }    
    
    return {
        layer: layer,
        difference: difference
    };
    
};


UserConsole.prototype.startWeightChange = function(newValue, oldValue) {
    
    var speed = this.time.speed;
    this.time.total = 1/speed;
    this.time.start = new Date();
    
    
    
    var weightChange = this.determineEdgeWeightChange(newValue, oldValue);
    
    //if ()
    if (weightChange.difference === 0) { return; }
    
    this.WEIGHT_CHANGE = weightChange.layer.toUpperCase();
    
};

//-------------------------------------//
/////////////////////////////////////////
// Activity Log Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Activity_Log_Methods_________ = function() {};


UserConsole.prototype.getActivityLog = function() {
    return this.activity;
};

UserConsole.prototype.log = function(text) {
    
    var log = this.activity.log;    
    log.push(text);
    
};

//-------------------------------------//
/////////////////////////////////////////
// Map State Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Map_State_Methods_________ = function() {};

UserConsole.prototype.toggleMapState = function(state) {
    this.map.state = state;
};


UserConsole.prototype.getMapState = function() {
    return this.map.state;
};

//-------------------------------------//
/////////////////////////////////////////
// Grid Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Grid_Methods_________ = function() {};


UserConsole.prototype.toggleGrid = function(state) {
    this.grid.layer = state;
};

UserConsole.prototype.isGridVisible = function() {
    return this.grid.layer;
};


//-------------------------------------//
/////////////////////////////////////////
// Speed Settings Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Speed_Settings_Methods_________ = function() {};

UserConsole.prototype.holdSpeedButton = function(speed) {   
    this.speed.button.hold = speed;
};

UserConsole.prototype.clickSpeedButton = function(speed) {   
    this.speed.button.click = speed; 
};


UserConsole.prototype.getSpeedButton = function() {
    return this.speed.button;
};


//-------------------------------------//
/////////////////////////////////////////
// Gender Settings Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________Gender_Settings_Methods_________ = function() {};

UserConsole.prototype.clickGenderButton = function(gender) {
    this.gender.button.click = gender;
};

UserConsole.prototype.holdGenderButton = function(gender) {
    this.gender.button.hold = gender;
};


UserConsole.prototype.toggleGender = function() {
    
    if (this.gender.button.click === 'BOY') {
        this.gender.button.click = 'GIRL';
    } else {
        this.gender.button.click = 'BOY';
    }
    
};

UserConsole.prototype.getGenderButton = function() {
    return this.gender.button;   
};

//-------------------------------------//
/////////////////////////////////////////
// User Input Methods
/////////////////////////////////////////
//-------------------------------------//

UserConsole.prototype._________User_Input_Methods_________ = function() {};

UserConsole.prototype.handleKeyboardGamepadInput = function(input) {
    
    if (input === 'LEFT' ||
            input === 'RIGHT' ||
            input === 'UP' ||
            input === 'DOWN') {
        this.game.KEYPRESS = input;
        this.input.direction = input;
    }
    else if (input === 'A') {
        this.toggleGender();
    }
    else if (input === 'B') {
        this.holdSpeedButton(2);
    };
    
};

UserConsole.prototype.cancelKeyboardGamepadInput = function(input) {
    
    // If input already matches game's direction
    // Or input is null (unilaterally cancel)
    if (input === this.game.KEYPRESS || !input) {
        this.game.KEYPRESS = null;
        this.input.direction = null;
    }
    else if (input === 'A') {
        // Do nothing
    }
    else if (input === 'B') {       
        // Stop 'holding' speed button
        this.holdSpeedButton(null);
    }
    
};

UserConsole.prototype.setDirection = function(direction) {
    this.input.direction = direction;
};

UserConsole.prototype.getDirection = function() {
    return this.input.direction;
};