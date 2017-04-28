var UserConsole = function(game) {
    
    this.game = game;
    
    this.algorithms = {
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
    
    this.locations = [
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
    
    this.selectedAlgorithm = this.algorithms[0];
    this.sourceLocation = {
        id: 1,
        label: 'Entrance',
        keyTile: 0
    };
    
    this.targetLocation = this.locations[2];
    
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
    
    this.edgeWeight = {
        background: 1,
        foreground: 10,
        water: 20 ,
        min: 1,
        max: 30
    };
    
    this.LAYER = null;
    
    this.hexWeightLayer = "#FFEB3B";
    this.opacity = .3;
    
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




UserConsole.prototype.getSourceLocation = function() {
    
    return this.sourceLocation;
    
};

UserConsole.prototype.getLocationTile = function(sourceTarget) {
    
    var game = this.game;
    
    var location;
    if (sourceTarget === 'SOURCE') {
        location = this.sourceLocation;
    }
    else {
        location = this.targetLocation;
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


UserConsole.prototype.getTargetLocation = function() {
    
    return this.targetLocation;
    
};

UserConsole.prototype.setSourceLocation = function(id) {
    
    var location = this.locations[id];
    this.sourceLocation.label = location.label;
    this.sourceLocation.id = location.id;
    
};

UserConsole.prototype.setTargetLocation = function(id) {
    
    var location = this.locations[id];
    this.targetLocation.label = location.label;
    this.targetLocation.id = location.id;
    
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