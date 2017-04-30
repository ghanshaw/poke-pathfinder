var UserConsole = function(game) {
    
    this.game = game;
    
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
            keyTile: 1
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
    
    
    
    this.message = {
        
        content: 'Default message',
        log: []
        
    };
    
    this.createWeightLayers();
    
    // Time measures used to account for movement
    this.time = {
        start: null,
        total: null,
        delta: null,
        percent: null,
        speed: .6
    };
    
    
//    
//    this.map.mode;
//    this.pathfinder.mode;
    
    
    this.LAYER = null;
    
    this.hexWeightLayer = "#FFEB3B";
    this.opacity = .3;
    
    
    
    
    
    
    
    
        // Settings
    this.speed = 0;
    
    this.layers = {
        GRID: false,
        PATH: false,
        VISUALIZER: false
    };

    this.algorithms.selected = this.algorithms.options[0];
    this.locations.source = this.locations.options[1];
    this.locations.target = this.locations.options[2];
    
    this.pathmarker = {
        source: {
            show: false,
            disabled: false
        },
        target: {
            show: false,
            disabled: false
        }
    };
    
    
    this.vcr = {
        COMMAND: null
    };
    this.map = {
        state: 'BITMAP'
    };
    
    this.edge_weight = {
        background: 1,
        foreground: 10,
        water: 20 ,
        min: 1,
        max: 30
    };
    
    
    this.pathfinder = {
        state: null,
        layer: {
            path: {
                on: false,
                disabled: false,
                active: false
            },
            frontier: {
                on: false,
                disabled: false,
                active: false,
            }
        }        
    };
    
    
//    this.selected_algorithm = this.algorithms[0];
//    this.source_location = this.locations[1];
//    this.target_location = this.locations[2];
    
//     this.pathlayer = 
//    
//    this.frontierlayer = {
//        on: false,
//        disabled: false
//    };
    
    
    
    
    
    
    
    
};


UserConsole.prototype.updateSettings = function() {
    
    var game = this.game;
    
    this.pathfinder.state = game.getPathfinderState();
    this.pathfinder.layer.path.disabled = true;
    this.pathfinder.layer.frontier.disabled = true;
    
    if (game.getPathfinderState() === 'MARK SOURCE') {
        this.pathmarker.source.disabled = true;
    } else {
        this.pathmarker.source.disabled = false;
    }
    
    if (game.getPathfinderState() === 'MARK TARGET') {
        this.pathmarker.target.disabled = true;
    } else {
        this.pathmarker.target.disabled = false;
    }
    
    if (game.getPathfinderState() === 'PATH') {
        this.pathfinder.layer.path.disabled = false;
    } 
    
    if (game.getPathfinderState() === 'FRONTIER') {
        this.pathfinder.layer.frontier.disabled = false;
    } 
    

    //this.vcr.COMMAND = game.getVCRCommand();

};


UserConsole.prototype.getSelectedAlgorithm = function() {
    return this.algorithms.selected;
};

UserConsole.prototype.setSelectedAlgorithm = function(algorithm) {
    this.algorithms.selected = algorithm;
};

UserConsole.prototype.getAlgorithms = function() {
    return this.algorithms.options;
};

UserConsole.prototype.getEdgeWeights = function() {
    return this.edgeWeight;
};


UserConsole.prototype.getLocations = function() {
    return this.locations.options;
};

UserConsole.prototype.getSourceLocation = function() {
    return this.locations.source;
};

UserConsole.prototype.setSourceLocation = function(location) {
    this.locations.source = location;    
};

UserConsole.prototype.getTargetLocation = function() {
    return this.locations.target;
};

UserConsole.prototype.setTargetLocation = function(location) {
    this.locations.target = location;    
};

UserConsole.prototype.startPathfinder = function(state) {    
    this.game.startPathfinder(state);    
};

UserConsole.prototype.clearPathfinder = function() {
    this.game.clearPathfinder();    
};

UserConsole.prototype.getPathfinderState = function() {
    return this.pathfinder.state;
};

UserConsole.prototype.handleVCRCommand = function(command) {
    
    if (this.pathfinder.state !== 'PATH'  &&
            this.pathfinder.state !== 'FRONTIER') {
        console.info("You much be generating a frontier or following a path to use the VCR");
        return;
    }
    
    var vcr = this.vcr;
    
    if (command === 'PLAY') {
        vcr.COMMAND = 'PLAY';
    }
    
    else if (command === 'PAUSE') {
        vcr.COMMAND = 'PAUSE';
    }
    
    else if (command === 'STEP') {
        vcr.COMMAND = 'STEP';
    }
    
    console.info(vcr);
    
};


UserConsole.prototype.getVCRCommand = function() {
    return this.vcr.COMMAND;
};

UserConsole.prototype.toggleMapState = function(state) {
    this.map.state = state;
};

UserConsole.prototype.toggleGrid = function(state) {
    this.layers.GRID = state;
};





UserConsole.prototype.getPathMarker = function(point) {
    
    if (point === 'SOURCE') {

        return this.pathmarker.source;
    }
    
    else if (point === 'TARGET') {
        return this.pathmarker.target;
    }
    
};


UserConsole.prototype.togglePathMarker = function(point, checkbox) {
  
    var game = this.game;
    var pathmarker;
    
    if (point === 'SOURCE') {
        pathmarker = this.pathmarker.source;
    } else {
        pathmarker = this.pathmarker.target;
    }
  
    // If pathfinder is currently in MARK SOURCE or MARK TARGET states
    if (game.getPathfinderState().search(point) !== -1) {
        checkbox.disabled = true;
        checkbox.active = false;
        checkbox.label = '';
        pathmarker.show = false;
        return;
    }
    
    var status = pathmarker.show;
    
    checkbox.disabled = false;
    checkbox.active = !status;
    pathmarker.show = !status;
    
    if (pathmarker.show) {
        checkbox.label = 'hide';
    } else {
        checkbox.label = 'show';
    }
  
};





UserConsole.prototype.getPathlayer = function() {
    return this.pathlayer;
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


UserConsole.prototype.getFrontierlayer = function() {
    return this.pathlayer;
};


UserConsole.prototype.togglePathfinderLayer = function(selection, button) {
   

    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    if (layer.disabled) { 
        return; 
    }
    else if (button.click) {
        var state = layer.active;
        layer.active = !state;
        layer.on = layer.active;
    }   
    else if (button.hover) {
        layer.on = true;
    }      
    else {
        layer.on = layer.active;
    }
    
};

UserConsole.prototype.getPathfinderLayer = function(selection) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    return layer;
    
};

UserConsole.prototype.activatePathfinderLayer = function(selection, state) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    layer.on = state;
    layer.active = state;
};

UserConsole.prototype.setPlayerSpeed = function(speed) {    
    this.game.setPlayerSpeed(speed);
    this.speed = speed;
};

UserConsole.prototype.setPlayerGender = function(gender) {
    this.game.setPlayerGender(gender);
    this.gender = gender;
};



UserConsole.prototype.createWeightLayers = function() {
    
    var game = this.game;
    var floors = this.game.map.floors;
    
    for (let f in floors) {
        
        let floor = floors[f];
        let frame = floor.frame;
        
        let tile_size = floor.tile_size;
        
        var background = game.createBlankLayer(frame.canvas);
        var foreground = game.createBlankLayer(frame.canvas);
        var water = game.createBlankLayer(frame.canvas);
        
        background.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        foreground.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        water.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        
        
        // Create various edge weight layers
        for (let r = 0; r < floor.rows; r++) {
            for (let c = 0; c < floor.cols; c++) {
                
                let tile = floor.getTile(r, c);
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
        
        floor.weightlayer = {
            background: background,
            foreground: foreground,
            water: water
        };
        
        
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


UserConsole.prototype.startInterpolateWeightLayer = function(newValue, oldValue) {
    
    var speed = this.time.speed;
    this.time.total = 1/speed;
    this.time.start = new Date();
    
    var weightChange = this.determineEdgeWeightChange(newValue, oldValue);
    
    //if ()
    if (weightChange.difference === 0) { return; }
    
    this.LAYER = weightChange.layer.toUpperCase();
    
    console.log(weightChange);
    
    //this.show = true;
    
};


UserConsole.prototype.drawWeightLayers = function(floor) {
    
    if (!this.LAYER) { return;  }
    
    var time = this.time;
    this.time.delta = (new Date() - time.start)/1000;    
    this.time.percent = time.delta/time.total; 
    this.alpha = time.percent;
    
    var layer;
    if (this.LAYER === 'BACKGROUND') {
        layer = floor.weightlayer.background;
    }
    else if (this.LAYER === 'FOREGROUND') {
        layer = floor.weightlayer.foreground;
    }
    else if (this.LAYER === 'WATER') {
        layer = floor.weightlayer.water;
    }
    
    floor.frame.ctx.globalAlpha = 1 - this.alpha;
    floor.frame.ctx.drawImage(layer.canvas, 0, 0);
    floor.frame.ctx.globalAlpha = 1;
    
    if (time.percent >= .9) {
        this.LAYER = null;
        console.log(this.edgeWeight);
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
        var keyTileId = location.keyTile;
        tile = game.getKeyTile(keyTileId);   
    }
    else if (location.id === 3) {
        tile = game.getRandomTile();       
    }
    else if (location.id === 4) {
        tile = game.getPathMarkerTile(sourceTarget);
    }
    else if (location.id === 5) {
        tile = game.getPathMarkerTile(sourceTarget);
    }
    
    return tile;
    
};






UserConsole.prototype.activatePathFrontierButton = function(button) {
    
    if (button === 'FRONTIER') {
        this.frontierButton.click = true;
    }
    else if (button === 'PATH') {
        this.pathButton.click = true;
    }
    
};


UserConsole.prototype.log = function(text) {
    
    var log = this.message.log;
    
    if (log.length === 5) {
        log.shift();
    }
    
    
    log.push(text);
    console.log(this.message);
    
    
    
    
};


UserConsole.prototype.toggleFrontierPathLayers = function(button, action) {
    
    // If the layer is avaiable
    if (this.game.pathfinder.LAYER === button) {
        
        if (action === 'ON') {
            
            // Turn it on
            this.game.map.layers.PATHFINDER = button;
        } else if (action === 'OFF') {
            this.game.map.layers.PATHFINDER = null;
        }
        else if (action === 'SWITCH') {
            let layer = this.game.map.layers.PATHFINDER;
            
            this.game.map.layers.PATHFINDER = button ? layer === null : null;
        }
        //        // If layer is off, turn it on
        //        if (this.map.layers.PATHFINDER !== layer) {
        //            
        //        }
        return true;
    }
    
    this.game.map.layers.PATHFINDER = null;
    return false;
    
};
