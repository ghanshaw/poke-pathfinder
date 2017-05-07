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
    
    
    
    this.message = {
        
        content: 'Default message',
        log: []
        
    };
    
    
    
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
    
    
    
    
    this.WEIGHT_CHANGE = null;
    
    
    
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
    
    
    this.map = {
        state: 'BITMAP',
        button: {
            click: 'BITMAP',
            hover: null
        }
    };
    
    this.edgeweight = {
        background: 1,
        foreground: 10,
        water: 20 ,
        min: 1,
        max: 30
    };
    
        // Settings
    this.speed = {
        button: {
            click: 1,
            hold: null,
        }
    };
    
    this.interface = {
        gameboy: {
            locked: false
        },
        monitor: {}
    }
    
    this.gender = {
        button: {
            click: 'BOY',
            hold: null,
        }
    };
    
    
//    
//    this.pathfinder = {
//        state: null,
//        layer: {
//            path: {
//                on: false,
//                disabled: false,
//                active: false
//            },
//            frontier: {
//                on: false,
//                disabled: false,
//                active: false,
//            }
//        }        
//    };
    
    
    
    this.floors = {};
    
    
};

UserConsole.prototype.init = function() {
    this.initWeightLayers();
    
    // Implement initial settings
    this.initSettings();
};

UserConsole.prototype.initSettings = function() {
    
    this.pointmarker.source.show = false;
    this.pointmarker.target.show = false;
    
};


UserConsole.prototype.updateSettings = function() {
    
    var game = this.game;
    
    var pathfinder = this.pathfinder;
    pathfinder.state = game.getPathfinderState();
    
    
    //this.pathfinder.layer.path.disabled = true;
    //this.pathfinder.layer.frontier.disabled = true;
    
   
    
    
    // Activate checkboxes if point markers are showing
    this.pointmarker.source.checkbox.active = this.pointmarker.source.show;
    this.pointmarker.target.checkbox.active = this.pointmarker.target.show;
    
    
    
    if (pathfinder.state === 'MARK SOURCE' ||
          pathfinder.state === 'DRAG SOURCE') {
        
        // Pointmarker button is active
        this.pointmarker.source.button.active = true;
        
        // Checkbox is disabled and inactive
        this.pointmarker.source.checkbox.disabled = true;
        this.pointmarker.source.checkbox.active = false;
        
        
    } 
    // Cannot move pointmarker when pathfinder is active
    else if (pathfinder.state === 'PATH' ||
            pathfinder.state === 'FRONTIER') {
        
        // Pointmarker button is disabled
        this.pointmarker.source.button.acive = false;
        this.pointmarker.source.button.disabled = true;      
        
    } else {
        // Button is enabled, but inactive
        this.pointmarker.source.button.disabled = false; 
        this.pointmarker.source.button.active = false;
        
        // Checkbox is enabled
        this.pointmarker.source.checkbox.disabled = false;
    }
    
    if (pathfinder.state === 'MARK TARGET' ||
            pathfinder.state === 'DRAG TARGET') {
        // Pointmarker button is active
        this.pointmarker.target.button.active = true;
        
        // Checkbox is disabled and inactive
        this.pointmarker.target.checkbox.disabled = true;
        this.pointmarker.target.checkbox.active = false;
    } // Cannot move pointmarker when pathfinder is active
    else if (pathfinder.state === 'PATH' ||
            pathfinder.state === 'FRONTIER') {
        
        // Pointmarker button is disabled
        this.pointmarker.target.button.acive = false;
        this.pointmarker.target.button.disabled = true;      
        
    } else {
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
    
    // Enable pathfinder task buttons by default
    pathfinder.task.path.button.disabled = false;
    pathfinder.task.frontier.button.disabled = false;
    
    // Turn the pathfinder task buttons on and off
    if (pathfinder.state === 'PATH') {
        pathfinder.task.path.button.active = true;
    } else {
        pathfinder.task.path.button.active = false;
    }
    
    if (pathfinder.state === 'FRONTIER') {
        pathfinder.task.frontier.button.active = true;
    } else {
        pathfinder.task.frontier.button.active = false;
    }
    
    // Disable path task button if "all tiles" is target tile
    if (this.locations.target.id === 5) {
        pathfinder.task.path.button.disabled = true;
    }
    
    // Activate pathfinder layer buttons as necessary
    for (let l in pathfinder.layer) {
        let layer = pathfinder.layer[l];
        let LAYER = l.toUpperCase();
        
        // If path layer exists, enable the button       
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
        else if (layer.button.active) {           
            layer.show = true;          
        }
        else {
            // Default setting
            layer.show = false; 
        }
        
    }
    
    
    // Speed settings
    if (this.speed.button.hold) {
        this.game.setPlayerSpeed(this.speed.button.hold);
    }
    else {
        this.game.setPlayerSpeed(this.speed.button.click);
    }
    
    // Gender settings
    if (this.gender.button.hold) {
        this.game.setPlayerGender(this.gender.button.hold);
    }
    else {
        this.game.setPlayerGender(this.gender.button.click);
    }
    
    
            
//    
//    
//    // If frontier layer exists, button should be enabled
//    if (game.hasPathfinderLayer('FRONTIER')) {
//        this.pathfinder.layer.frontier.button.disabled = false;
//    } else {
//        this.pathfinder.layer.frontier.button.disabled = true;
//        this.pathfinder.layer.frontier.button.active = false;
//    }

    // Turn VCR off if pathfinder is off
    if (pathfinder.state === 'OFF') {
        this.vcr.command = null;
    }
    
    
    // VCR Settings
    var vcr = this.vcr;
    for (let b in vcr.button) {
        
        vcr.button[b].active = false;
        vcr.button[b].disabled = false;
        
        // Make case of b match command
        var B = b.toUpperCase();
        
        if (vcr.command === null) {
            vcr.button[b].disabled = true;
        }
        
        // Active pause button if user presses 'STEP'
        else if (vcr.command === 'STEP' &&
                B === 'PAUSE') {
            vcr.button[b].disabled = false;
            vcr.button[b].active = true;
        }
        
        else if (vcr.command === B) {
            vcr.button[b].disabled = false;
            vcr.button[b].active = true;
        };
 
    }
 
    
    
    
    // Map settings
    
    // Turn Graphic/Bitmap layers on/off based on variables
//    var mapStateButton = $scope.mapStateButton;
    
//    if (this.map.button.hover) {
//        this.map.state = this.map.button.hover
//    }
//    else {
//        userConsole.toggleMapState(mapStateButton.click);
//    }
//    
//    
    
//    
//    if (game.getPathfinderState() === 'PATH') {
//        this.pathfinder.layer.path.disabled = false;
//    } 
//    
//    if (game.getPathfinderState() === 'FRONTIER') {
//        this.pathfinder.layer.frontier.disabled = false;
//    } 
//    

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
    return this.edgeweight;
};


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
        vcr.command = 'PLAY';
    }
    
    else if (command === 'PAUSE') {
        vcr.command = 'PAUSE';
    }
    
    else if (command === 'STEP') {
        vcr.command = 'STEP';
    }
    
    console.info(vcr);
    
};


UserConsole.prototype.getVCRCommand = function() {
    return this.vcr.command;
};

UserConsole.prototype.setVCRCommand = function(command) {
    this.vcr.command = command;
};

UserConsole.prototype.getVCR = function() {
    return this.vcr;
};

UserConsole.prototype.toggleMapState = function(state) {
    this.map.state = state;
};


UserConsole.prototype.getMapState = function() {
    return this.map.state;
};

UserConsole.prototype.toggleGrid = function(state) {
    this.layers.GRID = state;
};

UserConsole.prototype.isGridVisible = function() {
    return this.layers.GRID;
};

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
        
  
  
//    // If pathfinder is currently in MARK SOURCE or MARK TARGET states
//    if (game.getPathfinderState().search(point) !== -1) {
//        pointmarker.checkbox.disabled = true;
//        checkbox.active = false;
//        checkbox.label = '';
//        pointmarker.show = false;
//        return;
//    }
//    
//    var status = pointmarker.show;
//    
//    checkbox.disabled = false;
//    checkbox.active = !status;
//    pointmarker.show = !status;
//    
//    if (pointmarker.show) {
//        checkbox.label = 'hide';
//    } else {
//        checkbox.label = 'show';
//    }
  
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


UserConsole.prototype.getPathfinderLayer = function(selection) {
    
    if (selection === 'FRONTIER') {
        return this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.layer.path;
    }
    
    return this.pathfinder.layer;
    
};

UserConsole.prototype.isPathfinderLayerVisible = function(selection) {
    
    if (selection === 'FRONTIER') {
        return this.pathfinder.layer.frontier.show;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.layer.path.show;
    }
    
};





UserConsole.prototype.getPathfinderTask = function(selection) {


    if (selection === 'FRONTIER') {
        return  this.pathfinder.task.frontier;        
    } else if (selection === 'PATH') {      
        return this.pathfinder.task.path;
    }
    
    return this.pathfinder.task;
    
};
//
//UserConsole.prototype.togglePathfinderLayerButton = function(selection, button) {
//   
//
//    if (selection === 'FRONTIER') {
//        layer = this.pathfinder.layer.frontier;        
//    } else if (selection === 'PATH') {      
//        layer = this.pathfinder.layer.path;
//    }
//    
//    if (layer.disabled) { 
//        return; 
//    }
//    else if (button.click) {
//        var state = layer.active;
//        layer.active = !state;
//        layer.on = layer.active;
//    }   
//    else if (button.hover) {
//        layer.on = true;
//    }      
//    else {
//        layer.on = layer.active;
//    }
//    
//    
//    
//};
//






//UserConsole.prototype.existsPathfinderLayer = function(selection, bool) {
//    
//    var layer;
//    if (selection === 'FRONTIER') {
//        layer = this.pathfinder.layer.frontier;        
//    } else if (selection === 'PATH') {      
//        layer = this.pathfinder.layer.path;
//    }
//    
//    layer.exists = bool;
//};
//


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

//
//UserConsole.prototype.activatePathfinderLayerButton = function(selection, bool) {
//    
//    var layer;
//    if (selection === 'FRONTIER') {
//        layer = this.pathfinder.layer.frontier;        
//    } else if (selection === 'PATH') {      
//        layer = this.pathfinder.layer.path;
//    }
//    
//    layer.button.disabled = !bool;
//    layer.button.active = bool;
//};


UserConsole.prototype.showPathfinderLayer = function(selection, bool) {
    
    var layer;
    if (selection === 'FRONTIER') {
        layer = this.pathfinder.layer.frontier;        
    } else if (selection === 'PATH') {      
        layer = this.pathfinder.layer.path;
    }
    
    layer.show = bool;
};



UserConsole.prototype.setPlayerSpeed = function(speed) {    
    this.game.setPlayerSpeed(speed);
    this.speed = speed;
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
        
        // Create foreground, background and water layers for each floor
        var background = game.createCanvasCtx();
        background.canvas.width = width;
        background.canvas.height = height;
        
        var foreground = game.createCanvasCtx();        
        foreground.canvas.width = width;
        foreground.canvas.height = height;
        
        var water = game.createCanvasCtx();        
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
    
    console.log('USER CONSOLE');
    console.log(this.floors);
    
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
    
    this.game.drawImageToScreen(layer.canvas, 'floor', floorId, dof, '', '', alpha);

    if (time.percent >= .95) {
        this.WEIGHT_CHANGE = null;
        console.log(this.edgeWeight);
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
    
    console.log(weightChange);
    
    //this.show = true;
    
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
    
//    if (log.length === 5) {
//        log.shift();
//    }
    
    
    log.push(text);
    console.log(this.message);
    
    
    
    
};

UserConsole.prototype.getPath = function() {
  
    
    
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


UserConsole.prototype.targetTileIsAll = function() {
    // Return true if target location is set to 'All Tiles'
    return this.locations.target.id === 5;   
};

UserConsole.prototype.holdSpeedButton = function(speed) {   
    this.speed.button.hold = speed;
};


UserConsole.prototype.clickSpeedButton = function(speed) {   
    this.speed.button.click = speed; 
};


UserConsole.prototype.getSpeedButton = function() {
    return this.speed.button;
};

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